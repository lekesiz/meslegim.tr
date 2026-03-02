import { marked } from "marked";
import { storagePut } from "../storage";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const execAsync = promisify(exec);

/**
 * Generate PDF from markdown content using Chromium headless
 * @param markdown - Markdown content to convert
 * @param title - Report title
 * @param studentName - Student name for header
 * @returns S3 URL of the generated PDF
 */
export async function generatePDF(
  markdown: string,
  title: string,
  studentName: string
): Promise<string> {
  const tempId = randomBytes(8).toString("hex");
  const htmlPath = path.join("/tmp", `report-${tempId}.html`);
  const pdfPath = path.join("/tmp", `report-${tempId}.pdf`);

  try {
    // Convert markdown to HTML
    const htmlContent = await marked(markdown);

    // Create full HTML document with styling
    const fullHtml = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.6;
      color: #333;
      font-size: 11pt;
    }
    
    h1 {
      color: #2563eb;
      font-size: 24pt;
      margin-top: 0;
      padding-bottom: 10px;
      border-bottom: 3px solid #2563eb;
    }
    
    h2 {
      color: #1e40af;
      font-size: 18pt;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    h3 {
      color: #1e3a8a;
      font-size: 14pt;
      margin-top: 15px;
      margin-bottom: 8px;
    }
    
    p {
      margin: 10px 0;
      text-align: justify;
    }
    
    ul, ol {
      margin: 10px 0;
      padding-left: 30px;
    }
    
    li {
      margin: 5px 0;
    }
    
    strong {
      color: #1e40af;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      display: block;
    }
    
    .header h1 {
      margin: 0;
      border: none;
    }
    
    .header p {
      color: #666;
      font-size: 10pt;
      margin: 5px 0;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 9pt;
    }

    .page-number::after {
      content: counter(page);
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028218705/cDCfxYGTnZmArwPn.png" alt="Meslegim.tr Logo" class="logo" />
    <h1>Meslegim.tr</h1>
    <p>Kariyer Değerlendirme Platformu</p>
    <p><strong>${title}</strong></p>
    <p>${studentName}</p>
  </div>
  
  ${htmlContent}
  
  <div class="footer">
    <p>© 2026 Meslegim.tr - Tüm hakları saklıdır.</p>
    <p>Bu rapor Meslegim.tr tarafından otomatik olarak oluşturulmuştur.</p>
  </div>
</body>
</html>
`;

    // Write HTML to temp file
    await writeFile(htmlPath, fullHtml, "utf-8");

    // Generate PDF using Chromium headless
    await execAsync(
      `chromium-browser --headless --no-sandbox --disable-gpu --disable-dev-shm-usage --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
      { timeout: 30000 }
    );

    // Read PDF file
    const pdfBuffer = await readFile(pdfPath);

    // Upload to S3
    const fileKey = `reports/report-${tempId}.pdf`;
    const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

    // Cleanup temp files
    try {
      await unlink(htmlPath);
      await unlink(pdfPath);
    } catch {}

    return url;
  } catch (error) {
    // Cleanup on error
    try {
      await unlink(htmlPath);
      await unlink(pdfPath);
    } catch {}

    console.error("PDF generation error:", error);
    throw new Error("PDF oluşturulamadı. Lütfen tekrar deneyin.");
  }
}
