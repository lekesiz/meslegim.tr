import { generateStageReport } from './_core/reportGeneration';
import { convertMarkdownToPDF } from './_core/pdfExport';
import * as db from './db';

export async function generateStageReportAsync(userId: number, stageId: number) {
  try {
    // Get user info
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get stage with answers
    const stageData = await db.getStageWithAnswers(userId, stageId);
    if (!stageData) {
      throw new Error('Stage data not found');
    }

    const { stage, questions, answers } = stageData;

    // Prepare answers for report
    const formattedAnswers = questions.map(q => {
      const answer = answers.find(a => a.questionId === q.id);
      return {
        question: q.text,
        answer: answer?.answer || 'Cevaplanmadı',
      };
    });

    // Generate report content
    const reportContent = await generateStageReport(
      user.name || user.email || 'Öğrenci',
      stage.name,
      formattedAnswers
    );

    // Convert markdown to PDF and upload to S3 (optional - if fails, still save report)
    let fileUrl: string | undefined;
    let fileKey: string | undefined;
    
    try {
      const fileName = `stage-${stageId}-user-${userId}-${Date.now()}`;
      const result = await convertMarkdownToPDF(reportContent, fileName);
      fileUrl = result.fileUrl;
      fileKey = result.fileKey;
      console.log(`PDF generated successfully for user ${userId}, stage ${stageId}`);
    } catch (pdfError) {
      console.error('PDF generation failed, saving report without PDF:', pdfError);
      // Continue without PDF - report content is still valuable
    }
    
    // Save report to database (with or without PDF)
    await db.createReport({
      userId,
      stageId,
      type: 'stage',
      content: reportContent,
      status: 'pending',
      fileUrl: fileUrl || null,
      fileKey: fileKey || null,
    });

    console.log(`Report generated for user ${userId}, stage ${stageId}`);
  } catch (error) {
    console.error('Error generating stage report:', error);
    throw error;
  }
}
