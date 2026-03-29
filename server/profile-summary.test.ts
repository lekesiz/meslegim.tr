import { describe, it, expect } from 'vitest';
import { generateProfileSummary, getProfileSummaryContext } from './services/profileSummaryAnalyzer';
import type { StageAnswers } from './services/profileSummaryAnalyzer';

// Mock RIASEC stage answers
const riasecAnswers: StageAnswers = {
  stageId: 60001,
  stageName: 'RIASEC İlgi Envanteri',
  answers: [
    { question: 'Hangi alanda çalışmak istersiniz?', answer: 'Teknoloji ve yazılım geliştirme' },
    { question: 'Boş zamanlarınızda ne yaparsınız?', answer: 'Bilgisayar programlama ve araştırma' },
    { question: 'Hangi tür projeler ilginizi çeker?', answer: 'Veri analizi ve yapay zeka projeleri' },
    { question: 'İdeal çalışma ortamınız nasıl?', answer: 'Sessiz, bireysel çalışma alanı' },
    { question: 'Hangi becerilere sahipsiniz?', answer: 'Analitik düşünme, problem çözme, matematik' },
  ],
};

// Mock Values stage answers
const valuesAnswers: StageAnswers = {
  stageId: 70001,
  stageName: 'Kariyer Değerleri Envanteri',
  answers: [
    { question: 'Yüksek maaş almak benim için çok önemlidir', answer: '4' },
    { question: 'İşimde bağımsız çalışabilmek isterim', answer: '5' },
    { question: 'Başkalarına yardım etmek beni mutlu eder', answer: '3' },
    { question: 'Yaratıcı projeler üzerinde çalışmak isterim', answer: '5' },
    { question: 'İş güvencesi benim için önemlidir', answer: '4' },
    { question: 'Liderlik pozisyonunda olmak isterim', answer: '3' },
    { question: 'Sürekli yeni şeyler öğrenmek isterim', answer: '5' },
    { question: 'Topluma katkı sağlamak önemlidir', answer: '3' },
    { question: 'Prestijli bir işte çalışmak isterim', answer: '4' },
    { question: 'Esnek çalışma saatleri tercih ederim', answer: '5' },
  ],
};

// Mock Risk stage answers
const riskAnswers: StageAnswers = {
  stageId: 90004,
  stageName: 'Kariyer Risk Analizi',
  answers: [
    { question: 'Yeni bir şehre taşınmak', answer: 'Kesinlikle yaparım' },
    { question: 'Kendi işimi kurmak', answer: 'Muhtemelen yaparım' },
    { question: 'Farklı bir sektöre geçmek', answer: 'Kararsızım' },
    { question: 'Maaş kesintisi ile yeni bir kariyer', answer: 'Muhtemelen yapmam' },
    { question: 'Belirsiz bir startup\'a katılmak', answer: 'Kararsızım' },
  ],
};

describe('Profile Summary Analyzer', () => {
  it('should generate profile summary with single stage', () => {
    const result = generateProfileSummary([riasecAnswers]);
    
    expect(result).toBeDefined();
    expect(result.completedStageCount).toBe(1);
    expect(result.totalAnswerCount).toBe(5);
    expect(result.profileCompleteness).toBeGreaterThan(0);
    expect(result.profileCompleteness).toBeLessThanOrEqual(100);
    expect(result.riasec).not.toBeNull();
    expect(result.integratedInsights).toBeDefined();
    expect(result.integratedInsights.personalitySnapshot).toBeTruthy();
  });

  it('should generate profile summary with multiple stages', () => {
    const result = generateProfileSummary([riasecAnswers, valuesAnswers, riskAnswers]);
    
    expect(result).toBeDefined();
    expect(result.completedStageCount).toBe(3);
    expect(result.totalAnswerCount).toBe(20);
    expect(result.profileCompleteness).toBeGreaterThan(50);
    expect(result.riasec).not.toBeNull();
    expect(result.values).not.toBeNull();
    expect(result.risk).not.toBeNull();
  });

  it('should have integrated insights with dominant traits', () => {
    const result = generateProfileSummary([riasecAnswers, valuesAnswers]);
    
    expect(result.integratedInsights.dominantTraits).toBeDefined();
    expect(Array.isArray(result.integratedInsights.dominantTraits)).toBe(true);
    expect(result.integratedInsights.personalitySnapshot).toBeTruthy();
    expect(result.integratedInsights.strengthSummary).toBeTruthy();
    expect(result.integratedInsights.developmentSummary).toBeTruthy();
  });

  it('should include AI-proof career suggestions', () => {
    const result = generateProfileSummary([riasecAnswers, valuesAnswers]);
    
    expect(result.integratedInsights.aiProofCareers).toBeDefined();
    expect(Array.isArray(result.integratedInsights.aiProofCareers)).toBe(true);
    
    if (result.integratedInsights.aiProofCareers.length > 0) {
      const career = result.integratedInsights.aiProofCareers[0];
      expect(career.career).toBeTruthy();
      expect(career.aiProofScore).toBeGreaterThanOrEqual(0);
      expect(career.aiProofScore).toBeLessThanOrEqual(100);
      expect(career.reason).toBeTruthy();
    }
  });

  it('should calculate profile completeness correctly', () => {
    // Only RIASEC - should be partial
    const partial = generateProfileSummary([riasecAnswers]);
    expect(partial.profileCompleteness).toBeLessThan(100);
    
    // All three stages - should be higher
    const full = generateProfileSummary([riasecAnswers, valuesAnswers, riskAnswers]);
    expect(full.profileCompleteness).toBeGreaterThan(partial.profileCompleteness);
  });

  it('should handle empty stage answers gracefully', () => {
    const emptyStage: StageAnswers = {
      stageId: 99999,
      stageName: 'Empty Stage',
      answers: [],
    };
    
    const result = generateProfileSummary([emptyStage]);
    expect(result).toBeDefined();
    expect(result.completedStageCount).toBe(1);
    expect(result.totalAnswerCount).toBe(0);
  });

  it('should generate profile summary context string', () => {
    const summary = generateProfileSummary([riasecAnswers, valuesAnswers]);
    const context = getProfileSummaryContext(summary);
    
    expect(context).toBeTruthy();
    expect(typeof context).toBe('string');
    expect(context.length).toBeGreaterThan(50);
    // Should contain analysis keywords
    expect(context.toLowerCase()).toMatch(/riasec|kişilik|değer|profil/i);
  });

  it('should have RIASEC top3 codes', () => {
    const result = generateProfileSummary([riasecAnswers]);
    
    if (result.riasec) {
      expect(result.riasec.riasecTop3).toBeDefined();
      expect(Array.isArray(result.riasec.riasecTop3)).toBe(true);
      expect(result.riasec.riasecTop3.length).toBe(3);
      // Each should be a valid RIASEC code
      result.riasec.riasecTop3.forEach((code: string) => {
        expect(['R', 'I', 'A', 'S', 'E', 'C']).toContain(code);
      });
    }
  });

  it('should have values top and bottom values when values stage completed', () => {
    const result = generateProfileSummary([riasecAnswers, valuesAnswers]);
    
    if (result.values) {
      expect(result.values.topValues).toBeDefined();
      expect(result.values.bottomValues).toBeDefined();
      expect(Array.isArray(result.values.topValues)).toBe(true);
      expect(Array.isArray(result.values.bottomValues)).toBe(true);
      
      if (result.values.topValues.length > 0) {
        expect(result.values.topValues[0].name).toBeTruthy();
        expect(result.values.topValues[0].score).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should have risk profile when risk stage completed', () => {
    const result = generateProfileSummary([riasecAnswers, riskAnswers]);
    
    if (result.risk) {
      expect(result.risk.riskType).toBeDefined();
      expect(['risk-taker', 'balanced', 'cautious']).toContain(result.risk.riskType);
      expect(result.risk.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.risk.overallScore).toBeLessThanOrEqual(100);
      expect(result.risk.profile).toBeDefined();
      expect(result.risk.description).toBeTruthy();
    }
  });
});
