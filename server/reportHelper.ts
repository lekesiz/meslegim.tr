import { generateStageReport } from './_core/reportGeneration';
import { convertMarkdownToPDF } from './_core/pdfExport';
import * as db from './db';
import { performFullAnalysis } from './services/riasecAnalyzer';

export async function generateStageReportAsync(userId: number, stageId: number) {
  console.log(`[ReportGen] Starting report generation for user ${userId}, stage ${stageId}`);
  try {
    // Get user info
    console.log(`[ReportGen] Fetching user ${userId}...`);
    const user = await db.getUserById(userId);
    if (!user) {
      console.error(`[ReportGen] User ${userId} not found!`);
      throw new Error('User not found');
    }
    console.log(`[ReportGen] User found: ${user.name || user.email}`);

    // Get stage with answers
    console.log(`[ReportGen] Fetching stage data for stage ${stageId}...`);
    const stageData = await db.getStageWithAnswers(userId, stageId);
    if (!stageData) {
      console.error(`[ReportGen] Stage data not found for user ${userId}, stage ${stageId}!`);
      throw new Error('Stage data not found');
    }
    console.log(`[ReportGen] Stage data found: ${stageData.stage.name}, ${stageData.questions.length} questions, ${stageData.answers.length} answers`);

    const { stage, questions, answers } = stageData;

    // Prepare answers for report
    const formattedAnswers = questions.map(q => {
      const answer = answers.find(a => a.questionId === q.id);
      return {
        question: q.text,
        answer: answer?.answer || 'Cevaplanmadı',
      };
    });
    console.log(`[ReportGen] Formatted ${formattedAnswers.length} answers for LLM`);

    // Perform RIASEC analysis
    console.log(`[ReportGen] Performing RIASEC analysis...`);
    const riasecAnalysis = performFullAnalysis(formattedAnswers);
    console.log(`[ReportGen] RIASEC top 3: ${riasecAnalysis.riasecTop3.join(', ')}`);

    // Build RIASEC context for LLM
    const riasecContext = `\n\n## RIASEC Analiz Sonuçları (Otomatik Hesaplanmış)
R (Gerçekçi): ${riasecAnalysis.riasec.R}/100
I (Araştırmacı): ${riasecAnalysis.riasec.I}/100
A (Sanatsal): ${riasecAnalysis.riasec.A}/100
S (Sosyal): ${riasecAnalysis.riasec.S}/100
E (Girişimci): ${riasecAnalysis.riasec.E}/100
C (Geleneksel): ${riasecAnalysis.riasec.C}/100

En güçlü boyutlar: ${riasecAnalysis.strengthAreas.join(', ')}
Gelişim alanları: ${riasecAnalysis.developmentAreas.join(', ')}
Önerilen kariyer alanları: ${riasecAnalysis.careerSuggestions.join(', ')}

Lütfen bu RIASEC skorlarını da raporda değerlendir ve kariyer önerilerini buna göre destekle.`;

    // Generate report content with RIASEC context
    console.log(`[ReportGen] Calling LLM to generate report...`);
    const reportContent = await generateStageReport(
      user.name || user.email || 'Öğrenci',
      stage.name,
      user.ageGroup || '18-21',
      formattedAnswers.map((a, i) => ({
        ...a,
        answer: a.answer + (i === formattedAnswers.length - 1 ? riasecContext : ''),
      }))
    );
    console.log(`[ReportGen] LLM report generated, length: ${reportContent.length} chars`);

    // Convert markdown to PDF and upload to S3 (optional - if fails, still save report)
    let fileUrl: string | undefined;
    let fileKey: string | undefined;
    
    try {
      const fileName = `stage-${stageId}-user-${userId}-${Date.now()}`;
      console.log(`[ReportGen] Generating PDF: ${fileName}...`);
      const result = await convertMarkdownToPDF(reportContent, fileName);
      fileUrl = result.fileUrl;
      fileKey = result.fileKey;
      console.log(`[ReportGen] PDF generated successfully for user ${userId}, stage ${stageId}: ${fileUrl}`);
    } catch (pdfError) {
      console.error('[ReportGen] PDF generation failed, saving report without PDF:', pdfError);
      // Continue without PDF - report content is still valuable
    }
    
    // Extract summary from report content (first paragraph after first heading)
    const summaryMatch = reportContent.match(/##[^\n]*\n+([^\n#]{50,300})/);
    const summary = summaryMatch ? summaryMatch[1].trim().substring(0, 300) : reportContent.substring(0, 300).trim();
    
    // Save report to database (with or without PDF)
    console.log(`[ReportGen] Saving report to database...`);
    await db.createReport({
      userId,
      stageId,
      type: 'stage',
      content: reportContent,
      summary,
      status: 'pending',
      fileUrl: fileUrl || null,
      fileKey: fileKey || null,
    });

    console.log(`[ReportGen] ✅ Report successfully generated and saved for user ${userId}, stage ${stageId}`);
  } catch (error) {
    console.error(`[ReportGen] ❌ Error generating stage report for user ${userId}, stage ${stageId}:`, error);
    throw error;
  }
}
