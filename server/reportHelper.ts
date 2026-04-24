import { generateStageReport } from './_core/reportGeneration';
import { convertMarkdownToPDF } from './_core/pdfExport';
import * as db from './db';
import { performFullAnalysis } from './services/riasecAnalyzer';
import { performValuesAnalysis, getValuesContext } from './services/valuesAnalyzer';
import { performRiskAnalysis, getRiskContext } from './services/riskAnalyzer';
import logger from './utils/logger';

/**
 * Etap adından değerler testi olup olmadığını belirle
 */
function isValuesStage(stageName: string): boolean {
  const lower = (stageName || '').toLowerCase();
  return lower.includes('değer') || lower.includes('kariyer değerleri') || lower.includes('values');
}

/**
 * Etap adından risk analizi olup olmadığını belirle
 */
function isRiskStage(stageName: string): boolean {
  const lower = (stageName || '').toLowerCase();
  return lower.includes('risk') || lower.includes('kariyer risk');
}

export async function generateStageReportAsync(userId: number, stageId: number) {
  // logger.info(`[ReportGen] Starting report generation for user ${userId}, stage ${stageId}`);
  try {
    // Get user info
    // logger.info(`[ReportGen] Fetching user ${userId}...`);
    const user = await db.getUserById(userId);
    if (!user) {
      logger.error(`[ReportGen] User ${userId} not found!`);
      throw new Error('User not found');
    }
    // logger.info(`[ReportGen] User found: ${user.name || user.email}`);

    // Get stage with answers
    // logger.info(`[ReportGen] Fetching stage data for stage ${stageId}...`);
    const stageData = await db.getStageWithAnswers(userId, stageId);
    if (!stageData) {
      logger.error(`[ReportGen] Stage data not found for user ${userId}, stage ${stageId}!`);
      throw new Error('Stage data not found');
    }
    // logger.info(`[ReportGen] Stage data found: ${stageData.stage.name}, ${stageData.questions.length} questions, ${stageData.answers.length} answers`);

    const { stage, questions, answers } = stageData;

    // Prepare answers for report
    const formattedAnswers = questions.map(q => {
      const answer = answers.find(a => a.questionId === q.id);
      return {
        question: q.text,
        answer: answer?.answer || 'Cevaplanmadı',
      };
    });
    // logger.info(`[ReportGen] Formatted ${formattedAnswers.length} answers for LLM`);

    let analysisContext = '';

    // Determine analysis type based on stage name
    if (isRiskStage(stage.name)) {
      // Kariyer Risk Analizi
      // logger.info(`[ReportGen] Performing Risk analysis (Kariyer Risk Analizi)...`);
      const riskAnalysis = performRiskAnalysis(formattedAnswers);
      // logger.info(`[ReportGen] Risk type: ${riskAnalysis.riskType}, score: ${riskAnalysis.overallScore}/100`);
      analysisContext = getRiskContext(riskAnalysis);
    } else if (isValuesStage(stage.name)) {
      // Kariyer Değerleri Envanteri analizi
      // logger.info(`[ReportGen] Performing Values analysis (Kariyer Değerleri Envanteri)...`);
      const valuesAnalysis = performValuesAnalysis(formattedAnswers);
      // logger.info(`[ReportGen] Values top 3: ${valuesAnalysis.topValues.map(v => v.name).join(', ')}`);
      analysisContext = getValuesContext(valuesAnalysis);
    } else {
      // Standart RIASEC analizi
      // logger.info(`[ReportGen] Performing RIASEC analysis...`);
      const riasecAnalysis = performFullAnalysis(formattedAnswers);
      // logger.info(`[ReportGen] RIASEC top 3: ${riasecAnalysis.riasecTop3.join(', ')}`);

      analysisContext = `\n\n## RIASEC Analiz Sonuçları (Otomatik Hesaplanmış)
R (Gerçekçi): ${riasecAnalysis.riasec.R}/100
I (Araştırmacı): ${riasecAnalysis.riasec.I}/100
A (Sanatsal): ${riasecAnalysis.riasec.A}/100
S (Sosyal): ${riasecAnalysis.riasec.S}/100
E (Girişimci): ${riasecAnalysis.riasec.E}/100
C (Geleneksel): ${riasecAnalysis.riasec.C}/100

## Big Five Kişilik Profili
Deneyime Açıklık: ${riasecAnalysis.bigFive.openness}/100
Sorumluluk: ${riasecAnalysis.bigFive.conscientiousness}/100
Dışa Dönüklük: ${riasecAnalysis.bigFive.extraversion}/100
Uyumluluk: ${riasecAnalysis.bigFive.agreeableness}/100
Duygusal Denge: ${riasecAnalysis.bigFive.emotionalStability}/100

En güçlü boyutlar: ${riasecAnalysis.strengthAreas.join(', ')}
Gelişim alanları: ${riasecAnalysis.developmentAreas.join(', ')}
Önerilen kariyer alanları: ${riasecAnalysis.careerSuggestions.join(', ')}
Kişilik Özeti: ${riasecAnalysis.personalityInsights}

Lütfen bu RIASEC ve Big Five skorlarını raporda değerlendir ve kariyer önerilerini buna göre destekle.`;
    }

    // Generate report content with analysis context
    // logger.info(`[ReportGen] Calling LLM to generate report...`);
    const reportContent = await generateStageReport(
      user.name || user.email || 'Öğrenci',
      stage.name,
      user.ageGroup || '18-21',
      formattedAnswers.map((a, i) => ({
        ...a,
        answer: a.answer + (i === formattedAnswers.length - 1 ? analysisContext : ''),
      }))
    );
    // logger.info(`[ReportGen] LLM report generated, length: ${reportContent.length} chars`);

    // Convert markdown to PDF and upload to S3 (optional - if fails, still save report)
    let fileUrl: string | undefined;
    let fileKey: string | undefined;
    
    try {
      const fileName = `stage-${stageId}-user-${userId}-${Date.now()}`;
      // logger.info(`[ReportGen] Generating PDF: ${fileName}...`);
      const result = await convertMarkdownToPDF(reportContent, fileName);
      fileUrl = result.fileUrl;
      fileKey = result.fileKey;
      // logger.info(`[ReportGen] PDF generated successfully for user ${userId}, stage ${stageId}: ${fileUrl}`);
    } catch (pdfError) {
      logger.error('[ReportGen] PDF generation failed, saving report without PDF:', pdfError);
      // Continue without PDF - report content is still valuable
    }
    
    // Extract summary from report content (first paragraph after first heading)
    const summaryMatch = reportContent.match(/##[^\n]*\n+([^\n#]{50,300})/);
    const summary = summaryMatch ? summaryMatch[1].trim().substring(0, 300) : reportContent.substring(0, 300).trim();
    
    // Save report to database (with or without PDF)
    // logger.info(`[ReportGen] Saving report to database...`);
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

    // logger.info(`[ReportGen] ✅ Report successfully generated and saved for user ${userId}, stage ${stageId}`);
  } catch (error) {
    logger.error(`[ReportGen] ❌ Error generating stage report for user ${userId}, stage ${stageId}:`, error);
    throw error;
  }
}
