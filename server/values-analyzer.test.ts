import { describe, it, expect } from 'vitest';
import {
  analyzeValues,
  getTopAndBottomValues,
  getValuesAlignedCareers,
  performValuesAnalysis,
} from './services/valuesAnalyzer';

describe('Kariyer Değerleri Analiz Motoru', () => {
  // 30 soruluk test cevapları - her boyut için 3 soru
  const sampleAnswers = [
    // financial (Q1-3)
    { question: 'Yüksek maaşlı bir iş tercih ederim', answer: '5' },
    { question: 'Maddi kazanç benim için önemlidir', answer: '4' },
    { question: 'Gelir düzeyi kariyer seçimimde belirleyicidir', answer: '5' },
    // workLife (Q4-6)
    { question: 'İş-yaşam dengesi benim için önemlidir', answer: '3' },
    { question: 'Esnek çalışma saatleri tercih ederim', answer: '2' },
    { question: 'Kişisel zamanıma değer veririm', answer: '3' },
    // socialImpact (Q7-9)
    { question: 'Topluma katkı sağlamak isterim', answer: '4' },
    { question: 'İşimin dünyayı daha iyi yapmasını isterim', answer: '4' },
    { question: 'Sosyal sorumluluk projeleri ilgimi çeker', answer: '3' },
    // creativity (Q10-12)
    { question: 'Yaratıcı projeler beni motive eder', answer: '2' },
    { question: 'Özgün fikirler üretmekten keyif alırım', answer: '2' },
    { question: 'Sanatsal ifade benim için önemlidir', answer: '1' },
    // leadership (Q13-15)
    { question: 'Liderlik pozisyonlarını tercih ederim', answer: '4' },
    { question: 'Karar verme yetkisi benim için önemlidir', answer: '5' },
    { question: 'İnsanları yönlendirmekten keyif alırım', answer: '4' },
    // independence (Q16-18)
    { question: 'Bağımsız çalışmayı tercih ederim', answer: '3' },
    { question: 'Kendi kararlarımı vermek isterim', answer: '3' },
    { question: 'Otonom bir çalışma ortamı tercih ederim', answer: '2' },
    // security (Q19-21)
    { question: 'İş güvencesi benim için önemlidir', answer: '3' },
    { question: 'Düzenli gelir tercih ederim', answer: '4' },
    { question: 'Kariyerimde öngörülebilirlik isterim', answer: '3' },
    // intellectual (Q22-24)
    { question: 'Sürekli öğrenmeyi severim', answer: '4' },
    { question: 'Araştırma yapmaktan keyif alırım', answer: '3' },
    { question: 'Bilgi üretmek beni motive eder', answer: '4' },
    // teamwork (Q25-27)
    { question: 'Takım çalışmasını tercih ederim', answer: '3' },
    { question: 'İşbirliği yapmaktan keyif alırım', answer: '3' },
    { question: 'Ortak hedeflere ulaşmak beni motive eder', answer: '4' },
    // prestige (Q28-30)
    { question: 'Toplumda saygın bir konuma sahip olmak isterim', answer: '5' },
    { question: 'Profesyonel itibar benim için önemlidir', answer: '4' },
    { question: 'Tanınırlık beni motive eder', answer: '4' },
  ];

  describe('analyzeValues', () => {
    it('30 cevaptan 10 boyutlu değerler profili oluşturmalı', () => {
      const profile = analyzeValues(sampleAnswers);

      // Her boyut 0-100 arasında olmalı
      for (const value of Object.values(profile)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }

      // financial yüksek olmalı (5, 4, 5 cevapları)
      expect(profile.financial).toBeGreaterThan(70);

      // creativity düşük olmalı (2, 2, 1 cevapları)
      expect(profile.creativity).toBeLessThan(40);

      // leadership yüksek olmalı (4, 5, 4 cevapları)
      expect(profile.leadership).toBeGreaterThan(70);
    });

    it('boş cevapları 0 olarak değerlendirmeli', () => {
      const emptyAnswers = Array(30).fill({ question: 'Test', answer: '' });
      const profile = analyzeValues(emptyAnswers);

      for (const value of Object.values(profile)) {
        expect(value).toBe(0);
      }
    });

    it('Türkçe metin bazlı cevapları da desteklemeli', () => {
      const textAnswers = [
        { question: 'Test', answer: 'Kesinlikle Katılıyorum' },
        { question: 'Test', answer: 'Katılmıyorum' },
        { question: 'Test', answer: 'Kararsızım' },
        ...Array(27).fill({ question: 'Test', answer: '3' }),
      ];
      const profile = analyzeValues(textAnswers);
      expect(profile.financial).toBeGreaterThan(0);
    });
  });

  describe('getTopAndBottomValues', () => {
    it('en yüksek ve en düşük 3 değeri döndürmeli', () => {
      const profile = analyzeValues(sampleAnswers);
      const { top, bottom } = getTopAndBottomValues(profile);

      expect(top).toHaveLength(3);
      expect(bottom).toHaveLength(3);

      // Top değerler bottom'dan yüksek olmalı
      expect(top[0].score).toBeGreaterThanOrEqual(top[1].score);
      expect(top[1].score).toBeGreaterThanOrEqual(top[2].score);

      // Her değerin name ve description alanı olmalı
      for (const v of [...top, ...bottom]) {
        expect(v.name).toBeTruthy();
        expect(v.description).toBeTruthy();
        expect(v.key).toBeTruthy();
      }
    });
  });

  describe('getValuesAlignedCareers', () => {
    it('en az 3 kariyer önerisi döndürmeli', () => {
      const profile = analyzeValues(sampleAnswers);
      const careers = getValuesAlignedCareers(profile);

      expect(careers.length).toBeGreaterThanOrEqual(3);
      // Tekrar olmamalı
      expect(new Set(careers).size).toBe(careers.length);
    });
  });

  describe('performValuesAnalysis', () => {
    it('tam analiz sonucu döndürmeli', () => {
      const result = performValuesAnalysis(sampleAnswers);

      expect(result.profile).toBeDefined();
      expect(result.topValues).toHaveLength(3);
      expect(result.bottomValues).toHaveLength(3);
      expect(result.description).toContain('Kariyer Değerleri Profili');
      expect(result.careerAlignment.length).toBeGreaterThan(0);
      expect(result.insights).toBeTruthy();
    });

    it('description Markdown formatında olmalı', () => {
      const result = performValuesAnalysis(sampleAnswers);
      expect(result.description).toContain('##');
      expect(result.description).toContain('**');
    });
  });
});
