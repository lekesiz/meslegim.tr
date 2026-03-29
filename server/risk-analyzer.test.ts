import { describe, it, expect } from 'vitest';
import {
  analyzeRisk,
  calculateOverallRiskScore,
  determineRiskType,
  getTopAndBottomDimensions,
  performRiskAnalysis,
  getRiskContext,
} from './services/riskAnalyzer';

describe('Risk Analyzer', () => {
  // Cesur karar verici profili - tüm cevaplar risk-taker (ilk seçenek)
  const riskTakerAnswers = [
    { question: 'Soru 1', answer: 'Hemen yeni iş aramaya başlarım' },
    { question: 'Soru 2', answer: 'Fırsatı değerlendiririm' },
    { question: 'Soru 3', answer: 'Kendime güvenirim' },
    { question: 'Soru 4', answer: 'Belirsizlik beni heyecanlandırıyor' },
    { question: 'Soru 5', answer: 'Hemen ekip kurar, hayata geçirmeye çalışırım' },
    { question: 'Soru 6', answer: 'Freelance! Kendi patronum olmak istiyorum' },
    { question: 'Soru 7', answer: 'İlginç bir deneyim olur' },
    { question: 'Soru 8', answer: 'Heyecan verici! Yeni fırsatlar doğacak' },
    { question: 'Soru 9', answer: 'Kesinlikle kabul ederim' },
    { question: 'Soru 10', answer: 'İçgüdülerime güvenirim, hızlı karar veririm' },
  ];

  // Temkinli planlayıcı profili - tüm cevaplar cautious (son seçenek)
  const cautiousAnswers = [
    { question: 'Soru 1', answer: 'Güvenli bir alternatif bulana kadar sabrederim' },
    { question: 'Soru 2', answer: 'Mevcut alanımda uzmanlaşmayı tercih ederim' },
    { question: 'Soru 3', answer: 'Bu belirsizlik beni çok rahatsız ediyor' },
    { question: 'Soru 4', answer: 'Sürekli kontrol eder, çok endişelenirim' },
    { question: 'Soru 5', answer: 'Fikir güzel ama önce mezun olup deneyim kazanmalıyım' },
    { question: 'Soru 6', answer: 'Kurumsal iş, düzenli gelir ve güvence önemli' },
    { question: 'Soru 7', answer: 'Kendi alanımda iş bulmayı tercih ederim' },
    { question: 'Soru 8', answer: 'Endişeleniyorum, güvenli bir alan seçmeliyim' },
    { question: 'Soru 9', answer: 'Mevcut konumumda rahatım, stresi artırmak istemem' },
    { question: 'Soru 10', answer: 'Uzun süre düşünür, tüm riskleri analiz ederim' },
  ];

  // Dengeli profil - karışık cevaplar
  const balancedAnswers = [
    { question: 'Soru 1', answer: 'Önce durumu iyileştirmeye çalışırım' },
    { question: 'Soru 2', answer: 'Doğru fırsat olursa değerlendiririm' },
    { question: 'Soru 3', answer: 'Biraz stresli ama planlar yaparak yönetiyorum' },
    { question: 'Soru 4', answer: 'Bir süre bekler, sonra takip ederim' },
    { question: 'Soru 5', answer: 'Önce iş planı hazırlar, mentorlardan görüş alırım' },
    { question: 'Soru 6', answer: 'İkisi de cazip, duruma göre değişir' },
    { question: 'Soru 7', answer: 'Kariyer hedeflerime uyuyorsa düşünürüm' },
    { question: 'Soru 8', answer: 'Kendimi geliştirmem gerektiğini biliyorum' },
    { question: 'Soru 9', answer: 'Detayları öğrenir, hazır olup olmadığımı değerlendiririm' },
    { question: 'Soru 10', answer: 'Araştırma yapar, birkaç kişiye danışırım' },
  ];

  describe('analyzeRisk', () => {
    it('should return a profile with all 5 dimensions', () => {
      const profile = analyzeRisk(riskTakerAnswers);
      expect(profile).toHaveProperty('changeTolerance');
      expect(profile).toHaveProperty('uncertaintyMgmt');
      expect(profile).toHaveProperty('entrepreneurial');
      expect(profile).toHaveProperty('careerFlexibility');
      expect(profile).toHaveProperty('decisionStyle');
    });

    it('should return scores between 0 and 100', () => {
      const profile = analyzeRisk(riskTakerAnswers);
      for (const value of Object.values(profile)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('calculateOverallRiskScore', () => {
    it('should calculate average of all dimensions', () => {
      const profile = { changeTolerance: 80, uncertaintyMgmt: 60, entrepreneurial: 70, careerFlexibility: 90, decisionStyle: 50 };
      const score = calculateOverallRiskScore(profile);
      expect(score).toBe(70);
    });
  });

  describe('determineRiskType', () => {
    it('should return risk-taker for score >= 70', () => {
      expect(determineRiskType(70)).toBe('risk-taker');
      expect(determineRiskType(100)).toBe('risk-taker');
    });

    it('should return balanced for score 40-69', () => {
      expect(determineRiskType(40)).toBe('balanced');
      expect(determineRiskType(69)).toBe('balanced');
    });

    it('should return cautious for score < 40', () => {
      expect(determineRiskType(39)).toBe('cautious');
      expect(determineRiskType(0)).toBe('cautious');
    });
  });

  describe('getTopAndBottomDimensions', () => {
    it('should return correct top and bottom dimensions', () => {
      const profile = { changeTolerance: 90, uncertaintyMgmt: 30, entrepreneurial: 70, careerFlexibility: 50, decisionStyle: 10 };
      const { top, bottom } = getTopAndBottomDimensions(profile, 2);
      expect(top).toHaveLength(2);
      expect(bottom).toHaveLength(2);
      expect(top[0].key).toBe('changeTolerance');
      expect(bottom[0].key).toBe('decisionStyle');
    });
  });

  describe('performRiskAnalysis', () => {
    it('should return a complete analysis result', () => {
      const result = performRiskAnalysis(balancedAnswers);
      expect(result).toHaveProperty('profile');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('riskType');
      expect(result).toHaveProperty('profileResult');
      expect(result).toHaveProperty('topDimensions');
      expect(result).toHaveProperty('bottomDimensions');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('careerRecommendations');
    });

    it('should have profile result with title and description', () => {
      const result = performRiskAnalysis(balancedAnswers);
      expect(result.profileResult.title).toBeTruthy();
      expect(result.profileResult.description).toBeTruthy();
      expect(result.profileResult.strengths.length).toBeGreaterThan(0);
      expect(result.profileResult.watchOuts.length).toBeGreaterThan(0);
    });
  });

  describe('getRiskContext', () => {
    it('should return a non-empty context string for LLM', () => {
      const result = performRiskAnalysis(riskTakerAnswers);
      const context = getRiskContext(result);
      expect(context).toBeTruthy();
      expect(context).toContain('Kariyer Risk Analiz');
      expect(context).toContain('Risk Profili');
    });
  });

  describe('empty answers handling', () => {
    it('should handle empty answers array gracefully', () => {
      const result = performRiskAnalysis([]);
      expect(result.overallScore).toBe(0);
      expect(result.riskType).toBe('cautious');
    });
  });
});
