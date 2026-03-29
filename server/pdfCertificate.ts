import PDFDocument from "pdfkit";
import { storagePut } from "./storage";
import QRCode from "qrcode";
import path from "path";
import https from "https";
import http from "http";

interface CertificateData {
  studentName: string;
  certificateNumber: string;
  completionDate: Date;
  ageGroup: string;
  completedStages?: string[];
  riasecProfile?: string;
}

// CDN URLs for fonts and logo
const FONT_URLS = {
  sans: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028218705/jiPvNqaHRUg9H2uZgXUx3J/NotoSans-Regular_a302518e.ttf",
  serif: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028218705/jiPvNqaHRUg9H2uZgXUx3J/NotoSerif-Regular_7d24c3e1.ttf",
};
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028218705/jiPvNqaHRUg9H2uZgXUx3J/logo_5e673cad.png";

// Download a URL to a buffer
function downloadToBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadToBuffer(res.headers.location!).then(resolve).catch(reject);
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Color palette
const COLORS = {
  gold: "#C5A55A",
  goldDark: "#8B7335",
  goldLight: "#E8D5A3",
  navy: "#1B2A4A",
  navyLight: "#2D4373",
  white: "#FFFFFF",
  cream: "#FDF8EF",
  creamDark: "#F5ECDA",
  textDark: "#1F2937",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
};

export async function generateCertificatePDF(data: CertificateData): Promise<{ url: string; key: string }> {
  // Download fonts and logo
  let sansFont: Buffer | null = null;
  let serifFont: Buffer | null = null;
  let logoBuffer: Buffer | null = null;

  try {
    [sansFont, serifFont, logoBuffer] = await Promise.all([
      downloadToBuffer(FONT_URLS.sans),
      downloadToBuffer(FONT_URLS.serif),
      downloadToBuffer(LOGO_URL),
    ]);
  } catch (err) {
    console.error("Failed to download fonts/logo:", err);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    // Register custom fonts if available
    if (sansFont) {
      doc.registerFont("NotoSans", sansFont);
    }
    if (serifFont) {
      doc.registerFont("NotoSerif", serifFont);
    }

    const fontSans = sansFont ? "NotoSans" : "Helvetica";
    const fontSerif = serifFont ? "NotoSerif" : "Times-Roman";
    const fontBold = sansFont ? "NotoSans" : "Helvetica-Bold";

    const chunks: Buffer[] = [];
    const W = doc.page.width;  // 842
    const H = doc.page.height; // 595

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const fileKey = `certificates/${data.certificateNumber}.pdf`;
        const result = await storagePut(fileKey, pdfBuffer, "application/pdf");
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // ========================================
    // BACKGROUND
    // ========================================
    doc.rect(0, 0, W, H).fill(COLORS.cream);

    // ========================================
    // OUTER GOLD BORDER (triple line effect)
    // ========================================
    // Outermost border
    doc.rect(15, 15, W - 30, H - 30).lineWidth(3).stroke(COLORS.gold);
    // Middle border
    doc.rect(22, 22, W - 44, H - 44).lineWidth(1).stroke(COLORS.goldLight);
    // Inner border
    doc.rect(28, 28, W - 56, H - 56).lineWidth(2).stroke(COLORS.gold);

    // ========================================
    // CORNER DECORATIONS (ornamental L-shapes)
    // ========================================
    const cornerSize = 40;
    const cornerOffset = 35;
    const cornerWidth = 2.5;

    // Top-left corner
    doc.save();
    doc.lineWidth(cornerWidth).strokeColor(COLORS.goldDark);
    doc.moveTo(cornerOffset, cornerOffset + cornerSize)
       .lineTo(cornerOffset, cornerOffset)
       .lineTo(cornerOffset + cornerSize, cornerOffset)
       .stroke();
    // Small diamond at corner
    drawDiamond(doc, cornerOffset + 3, cornerOffset + 3, 6, COLORS.gold);
    doc.restore();

    // Top-right corner
    doc.save();
    doc.lineWidth(cornerWidth).strokeColor(COLORS.goldDark);
    doc.moveTo(W - cornerOffset - cornerSize, cornerOffset)
       .lineTo(W - cornerOffset, cornerOffset)
       .lineTo(W - cornerOffset, cornerOffset + cornerSize)
       .stroke();
    drawDiamond(doc, W - cornerOffset - 3, cornerOffset + 3, 6, COLORS.gold);
    doc.restore();

    // Bottom-left corner
    doc.save();
    doc.lineWidth(cornerWidth).strokeColor(COLORS.goldDark);
    doc.moveTo(cornerOffset, H - cornerOffset - cornerSize)
       .lineTo(cornerOffset, H - cornerOffset)
       .lineTo(cornerOffset + cornerSize, H - cornerOffset)
       .stroke();
    drawDiamond(doc, cornerOffset + 3, H - cornerOffset - 3, 6, COLORS.gold);
    doc.restore();

    // Bottom-right corner
    doc.save();
    doc.lineWidth(cornerWidth).strokeColor(COLORS.goldDark);
    doc.moveTo(W - cornerOffset - cornerSize, H - cornerOffset)
       .lineTo(W - cornerOffset, H - cornerOffset)
       .lineTo(W - cornerOffset, H - cornerOffset - cornerSize)
       .stroke();
    drawDiamond(doc, W - cornerOffset - 3, H - cornerOffset - 3, 6, COLORS.gold);
    doc.restore();

    // ========================================
    // TOP DECORATIVE LINE
    // ========================================
    const topLineY = 60;
    doc.save();
    doc.lineWidth(0.5).strokeColor(COLORS.goldLight);
    doc.moveTo(80, topLineY).lineTo(W / 2 - 60, topLineY).stroke();
    doc.moveTo(W / 2 + 60, topLineY).lineTo(W - 80, topLineY).stroke();
    // Center ornament
    drawDiamond(doc, W / 2, topLineY, 8, COLORS.gold);
    drawDiamond(doc, W / 2 - 20, topLineY, 4, COLORS.goldLight);
    drawDiamond(doc, W / 2 + 20, topLineY, 4, COLORS.goldLight);
    doc.restore();

    // ========================================
    // LOGO
    // ========================================
    let currentY = 72;
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, W / 2 - 22, currentY, { width: 44, height: 44 });
        currentY += 50;
      } catch {
        currentY += 10;
      }
    }

    // ========================================
    // TITLE: "BASARI SERTIFIKASI"
    // ========================================
    doc.fontSize(36).font(fontSerif).fillColor(COLORS.navy);
    doc.text("BASARI SERTIFIKASI", 0, currentY, {
      align: "center",
      width: W,
      characterSpacing: 4,
    });
    currentY += 44;

    // Subtitle
    doc.fontSize(11).font(fontSans).fillColor(COLORS.goldDark);
    doc.text("Meslegim.tr Kariyer Degerlendirme Platformu", 0, currentY, {
      align: "center",
      width: W,
      characterSpacing: 1,
    });
    currentY += 24;

    // ========================================
    // DECORATIVE DIVIDER
    // ========================================
    doc.save();
    doc.lineWidth(0.5).strokeColor(COLORS.gold);
    doc.moveTo(W / 2 - 120, currentY).lineTo(W / 2 + 120, currentY).stroke();
    drawDiamond(doc, W / 2, currentY, 5, COLORS.gold);
    doc.restore();
    currentY += 16;

    // ========================================
    // "Bu sertifika" text
    // ========================================
    doc.fontSize(12).font(fontSans).fillColor(COLORS.textMuted);
    doc.text("Bu sertifika", 0, currentY, {
      align: "center",
      width: W,
    });
    currentY += 20;

    // ========================================
    // STUDENT NAME (prominent)
    // ========================================
    doc.fontSize(28).font(fontSerif).fillColor(COLORS.indigo);
    doc.text(data.studentName.toUpperCase(), 0, currentY, {
      align: "center",
      width: W,
      characterSpacing: 2,
    });
    currentY += 38;

    // Underline for name
    const nameWidth = Math.min(doc.widthOfString(data.studentName.toUpperCase()), 400);
    doc.save();
    doc.lineWidth(1).strokeColor(COLORS.goldLight);
    doc.moveTo(W / 2 - nameWidth / 2 - 20, currentY)
       .lineTo(W / 2 + nameWidth / 2 + 20, currentY)
       .stroke();
    doc.restore();
    currentY += 14;

    // ========================================
    // ACHIEVEMENT TEXT
    // ========================================
    const ageGroupText =
      data.ageGroup === "14-17" ? "14-17 yas grubu" :
      data.ageGroup === "18-21" ? "18-21 yas grubu" :
      data.ageGroup === "22-24" ? "22-24 yas grubu" : data.ageGroup;

    doc.fontSize(11).font(fontSans).fillColor(COLORS.textDark);
    doc.text(
      `adina, ${ageGroupText} icin tasarlanmis AI destekli kariyer degerlendirme`,
      60, currentY,
      { align: "center", width: W - 120 }
    );
    currentY += 18;
    doc.text(
      "programinin tum etaplarini basariyla tamamladigi icin verilmistir.",
      60, currentY,
      { align: "center", width: W - 120 }
    );
    currentY += 28;

    // ========================================
    // COMPLETED STAGES (if provided)
    // ========================================
    if (data.completedStages && data.completedStages.length > 0) {
      doc.fontSize(9).font(fontSans).fillColor(COLORS.textMuted);
      doc.text("Tamamlanan Etaplar:", 0, currentY, {
        align: "center",
        width: W,
      });
      currentY += 14;

      const stageText = data.completedStages.join("  •  ");
      doc.fontSize(8).font(fontSans).fillColor(COLORS.navyLight);
      doc.text(stageText, 80, currentY, {
        align: "center",
        width: W - 160,
      });
      currentY += 16;
    }

    // ========================================
    // RIASEC PROFILE (if provided)
    // ========================================
    if (data.riasecProfile) {
      doc.fontSize(9).font(fontSans).fillColor(COLORS.textMuted);
      doc.text(`RIASEC Profili: ${data.riasecProfile}`, 0, currentY, {
        align: "center",
        width: W,
      });
      currentY += 16;
    }

    // ========================================
    // DATE AND CERTIFICATE NUMBER
    // ========================================
    const formattedDate = new Date(data.completionDate).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Bottom section layout
    const bottomY = H - 130;

    // Left side: Date
    doc.fontSize(10).font(fontSans).fillColor(COLORS.textMuted);
    doc.text("Duzenleme Tarihi", 80, bottomY, { width: 200 });
    doc.fontSize(11).font(fontSans).fillColor(COLORS.textDark);
    doc.text(formattedDate, 80, bottomY + 14, { width: 200 });

    // Center: Signature
    const sigX = W / 2 - 80;
    doc.save();
    doc.lineWidth(0.8).strokeColor(COLORS.goldDark);
    doc.moveTo(sigX, bottomY + 10).lineTo(sigX + 160, bottomY + 10).stroke();
    doc.restore();

    doc.fontSize(11).font(fontSerif).fillColor(COLORS.navy);
    doc.text("Meslegim.tr", sigX, bottomY + 16, {
      width: 160,
      align: "center",
    });
    doc.fontSize(8).font(fontSans).fillColor(COLORS.textMuted);
    doc.text("Kariyer Degerlendirme Platformu", sigX, bottomY + 30, {
      width: 160,
      align: "center",
    });

    // Right side: Certificate number
    doc.fontSize(10).font(fontSans).fillColor(COLORS.textMuted);
    doc.text("Sertifika No", W - 280, bottomY, { width: 200, align: "right" });
    doc.fontSize(9).font(fontSans).fillColor(COLORS.textDark);
    doc.text(data.certificateNumber, W - 280, bottomY + 14, { width: 200, align: "right" });

    // ========================================
    // QR CODE
    // ========================================
    const verifyUrl = `https://meslegim.tr/verify-certificate/${data.certificateNumber}`;
    QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
      color: { dark: COLORS.navy, light: "#00000000" },
    })
      .then((qrDataUrl) => {
        const qrX = W - 120;
        const qrY = H - 100;
        doc.image(qrDataUrl, qrX, qrY, { width: 60, height: 60 });

        doc.fontSize(7).font(fontSans).fillColor(COLORS.textLight);
        doc.text("QR ile Dogrula", qrX, qrY + 62, {
          width: 60,
          align: "center",
        });

        // ========================================
        // BOTTOM DECORATIVE LINE
        // ========================================
        const botLineY = H - 50;
        doc.save();
        doc.lineWidth(0.5).strokeColor(COLORS.goldLight);
        doc.moveTo(80, botLineY).lineTo(W / 2 - 60, botLineY).stroke();
        doc.moveTo(W / 2 + 60, botLineY).lineTo(W - 80, botLineY).stroke();
        drawDiamond(doc, W / 2, botLineY, 6, COLORS.gold);
        doc.restore();

        // ========================================
        // FOOTER
        // ========================================
        doc.fontSize(7).font(fontSans).fillColor(COLORS.textLight);
        doc.text(
          "Bu sertifika meslegim.tr platformu tarafindan dijital olarak olusturulmustur. Dogrulama icin QR kodu okutun.",
          0, H - 38,
          { align: "center", width: W }
        );

        doc.end();
      })
      .catch((error) => {
        console.error("QR code generation failed:", error);

        // Bottom decorative line (without QR)
        const botLineY = H - 50;
        doc.save();
        doc.lineWidth(0.5).strokeColor(COLORS.goldLight);
        doc.moveTo(80, botLineY).lineTo(W - 80, botLineY).stroke();
        doc.restore();

        doc.fontSize(7).font(fontSans).fillColor(COLORS.textLight);
        doc.text(
          "Bu sertifika meslegim.tr platformu tarafindan dijital olarak olusturulmustur.",
          0, H - 38,
          { align: "center", width: W }
        );

        doc.end();
      });
  });
}

// Helper: Draw a diamond shape
function drawDiamond(doc: PDFKit.PDFDocument, cx: number, cy: number, size: number, color: string) {
  doc.save();
  doc.fillColor(color);
  doc.moveTo(cx, cy - size / 2)
     .lineTo(cx + size / 2, cy)
     .lineTo(cx, cy + size / 2)
     .lineTo(cx - size / 2, cy)
     .closePath()
     .fill();
  doc.restore();
}
