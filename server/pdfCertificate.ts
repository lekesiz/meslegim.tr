import PDFDocument from "pdfkit";
import { storagePut } from "./storage";
import QRCode from "qrcode";

interface CertificateData {
  studentName: string;
  certificateNumber: string;
  completionDate: Date;
  ageGroup: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<{ url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];

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

    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f9fa");

    // Border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(3)
      .stroke("#4F46E5");

    // Inner border
    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(1)
      .stroke("#9CA3AF");

    // Title
    doc
      .fontSize(48)
      .font("Helvetica-Bold")
      .fillColor("#1F2937")
      .text("BAŞARI SERTİFİKASI", 0, 100, {
        align: "center",
        width: doc.page.width,
      });

    // Subtitle
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#6B7280")
      .text("Meslegim.tr Kariyer Değerlendirme Platformu", 0, 160, {
        align: "center",
        width: doc.page.width,
      });

    // Student name
    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#374151")
      .text("Bu sertifika", 0, 220, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .fontSize(32)
      .font("Helvetica-Bold")
      .fillColor("#4F46E5")
      .text(data.studentName, 0, 250, {
        align: "center",
        width: doc.page.width,
      });

    // Achievement text
    const ageGroupText = 
      data.ageGroup === "14-17" ? "14-17 yaş grubu" :
      data.ageGroup === "18-21" ? "18-21 yaş grubu" :
      data.ageGroup === "22-24" ? "22-24 yaş grubu" : data.ageGroup;

    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#374151")
      .text(
        `adına, ${ageGroupText} için tasarlanmış AI destekli kariyer değerlendirme`,
        0,
        300,
        {
          align: "center",
          width: doc.page.width,
        }
      );

    doc.text("programının tüm etaplarını başarıyla tamamladığı için verilmiştir.", 0, 325, {
      align: "center",
      width: doc.page.width,
    });

    // Completion date
    const formattedDate = new Date(data.completionDate).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#6B7280")
      .text(`Tamamlanma Tarihi: ${formattedDate}`, 0, 380, {
        align: "center",
        width: doc.page.width,
      });

    // Certificate number
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#9CA3AF")
      .text(`Sertifika No: ${data.certificateNumber}`, 0, 410, {
        align: "center",
        width: doc.page.width,
      });

    // Signature line
    const signatureY = doc.page.height - 120;
    doc
      .moveTo(doc.page.width / 2 - 100, signatureY)
      .lineTo(doc.page.width / 2 + 100, signatureY)
      .stroke("#9CA3AF");

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#374151")
      .text("Meslegim.tr", 0, signatureY + 10, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#6B7280")
      .text("Kariyer Değerlendirme Platformu", 0, signatureY + 30, {
        align: "center",
        width: doc.page.width,
      });

    // QR Code (async operation)
    const verifyUrl = `https://meslegim.tr/verify-certificate/${data.certificateNumber}`;
    QRCode.toDataURL(verifyUrl, { width: 100 })
      .then((qrDataUrl) => {
        // Add QR code image to PDF
        const qrX = doc.page.width - 130;
        const qrY = doc.page.height - 130;
        doc.image(qrDataUrl, qrX, qrY, { width: 80, height: 80 });

        // QR code label
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#6B7280")
          .text("Doğrulama", qrX, qrY + 85, {
            width: 80,
            align: "center",
          });

        // Footer
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#9CA3AF")
          .text("Bu sertifika meslegim.tr platformu tarafından dijital olarak oluşturulmuştur.", 0, doc.page.height - 40, {
            align: "center",
            width: doc.page.width,
          });

        doc.end();
      })
      .catch((error) => {
        console.error("QR code generation failed:", error);
        // Continue without QR code
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#9CA3AF")
          .text("Bu sertifika meslegim.tr platformu tarafından dijital olarak oluşturulmuştur.", 0, doc.page.height - 40, {
            align: "center",
            width: doc.page.width,
          });
        doc.end();
      });
  });
}
