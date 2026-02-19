import { storagePut } from '../storage';

/**
 * Convert markdown content to PDF and upload to S3
 * Uses manus-md-to-pdf utility which is available in the sandbox
 */
export async function convertMarkdownToPDF(
  markdown: string,
  fileName: string
): Promise<{ fileUrl: string; fileKey: string }> {
  const fs = await import('fs/promises');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  // Create temp files
  const tempMdPath = `/tmp/${fileName}.md`;
  const tempPdfPath = `/tmp/${fileName}.pdf`;
  
  try {
    // Write markdown to temp file
    await fs.writeFile(tempMdPath, markdown, 'utf-8');
    
    // Convert to PDF using manus-md-to-pdf utility
    await execAsync(`manus-md-to-pdf "${tempMdPath}" "${tempPdfPath}"`);
    
    // Read PDF file
    const pdfBuffer = await fs.readFile(tempPdfPath);
    
    // Generate S3 key with random suffix to prevent enumeration
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const fileKey = `reports/${fileName}-${randomSuffix}.pdf`;
    
    // Upload to S3
    const { url } = await storagePut(fileKey, pdfBuffer, 'application/pdf');
    
    // Cleanup temp files
    await fs.unlink(tempMdPath).catch(() => {});
    await fs.unlink(tempPdfPath).catch(() => {});
    
    return { fileUrl: url, fileKey };
  } catch (error) {
    // Cleanup on error
    await fs.unlink(tempMdPath).catch(() => {});
    await fs.unlink(tempPdfPath).catch(() => {});
    throw error;
  }
}
