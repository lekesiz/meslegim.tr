import { generateStageReportAsync } from './server/reportHelper.ts';

// Test Öğrenci 2 için rapor oluştur
const userId = 930012;
const stageId = 60004;

console.log(`Testing report generation for user ${userId}, stage ${stageId}...`);

try {
  await generateStageReportAsync(userId, stageId);
  console.log('✅ Report generated successfully!');
} catch (error) {
  console.error('❌ Report generation failed:', error);
  process.exit(1);
}
