/**
 * Kariyer Profili Özeti Analiz Motoru
 * 
 * Tüm etapların (RIASEC, Big Five, Değerler, Risk) sonuçlarını birleştirerek
 * bütünsel bir kariyer profili oluşturur.
 */

import { performFullAnalysis, type AnalysisResult } from './riasecAnalyzer';
import { performValuesAnalysis, type ValuesAnalysisResult } from './valuesAnalyzer';
import { performRiskAnalysis, type RiskAnalysisResult } from './riskAnalyzer';

export interface StageAnswers {
  stageId: number;
  stageName: string;
  answers: Array<{ question: string; answer: string }>;
}

export interface CareerProfileSummary {
  riasec: AnalysisResult | null;
  values: ValuesAnalysisResult | null;
  risk: RiskAnalysisResult | null;
  completedStageCount: number;
  totalAnswerCount: number;
  profileCompleteness: number; // 0-100
  integratedInsights: IntegratedInsights;
}

export interface IntegratedInsights {
  dominantTraits: string[];
  careerAlignment: string;
  strengthSummary: string;
  developmentSummary: string;
  topCareerSuggestions: string[];
  aiProofCareers: Array<{ career: string; aiProofScore: number; reason: string }>;
  personalitySnapshot: string;
}

/**
 * Etap adından hangi analiz tipine ait olduğunu belirle
 */
function classifyStage(stageName: string): 'riasec' | 'values' | 'risk' | 'general' {
  const lower = (stageName || '').toLowerCase();
  if (lower.includes('risk') || lower.includes('kariyer risk')) return 'risk';
  if (lower.includes('değer') || lower.includes('kariyer değerleri') || lower.includes('values')) return 'values';
  return 'riasec'; // Default: RIASEC/genel etaplar
}

/**
 * Tüm etap cevaplarını birleştirerek kapsamlı profil analizi yap
 */
export function generateProfileSummary(stageAnswers: StageAnswers[]): CareerProfileSummary {
  if (!stageAnswers || stageAnswers.length === 0) {
    return {
      riasec: null,
      values: null,
      risk: null,
      completedStageCount: 0,
      totalAnswerCount: 0,
      profileCompleteness: 0,
      integratedInsights: getEmptyInsights(),
    };
  }

  // Cevapları analiz tipine göre grupla
  const riasecAnswers: Array<{ question: string; answer: string }> = [];
  const valuesAnswers: Array<{ question: string; answer: string }> = [];
  const riskAnswers: Array<{ question: string; answer: string }> = [];

  for (const stage of stageAnswers) {
    const type = classifyStage(stage.stageName);
    switch (type) {
      case 'values':
        valuesAnswers.push(...stage.answers);
        break;
      case 'risk':
        riskAnswers.push(...stage.answers);
        break;
      default:
        riasecAnswers.push(...stage.answers);
        break;
    }
  }

  // Her analiz tipini çalıştır
  const riasecResult = riasecAnswers.length > 0 ? performFullAnalysis(riasecAnswers) : null;
  const valuesResult = valuesAnswers.length > 0 ? performValuesAnalysis(valuesAnswers) : null;
  const riskResult = riskAnswers.length > 0 ? performRiskAnalysis(riskAnswers) : null;

  const totalAnswerCount = riasecAnswers.length + valuesAnswers.length + riskAnswers.length;

  // Profil tamamlanma oranı: 3 ana analiz tipi
  const completedTypes = [riasecResult, valuesResult, riskResult].filter(Boolean).length;
  const profileCompleteness = Math.round((completedTypes / 3) * 100);

  // Entegre içgörüler oluştur
  const integratedInsights = generateIntegratedInsights(riasecResult, valuesResult, riskResult);

  return {
    riasec: riasecResult,
    values: valuesResult,
    risk: riskResult,
    completedStageCount: stageAnswers.length,
    totalAnswerCount,
    profileCompleteness,
    integratedInsights,
  };
}

/**
 * Tüm analiz sonuçlarını birleştirerek entegre içgörüler oluştur
 */
function generateIntegratedInsights(
  riasec: AnalysisResult | null,
  values: ValuesAnalysisResult | null,
  risk: RiskAnalysisResult | null,
): IntegratedInsights {
  const dominantTraits: string[] = [];
  const topCareerSuggestions: string[] = [];

  // RIASEC'ten baskın özellikler
  if (riasec) {
    dominantTraits.push(...riasec.riasecTop3.map(code => {
      const names: Record<string, string> = {
        R: 'Gerçekçi (Pratik)', I: 'Araştırmacı (Analitik)',
        A: 'Sanatsal (Yaratıcı)', S: 'Sosyal (Yardımsever)',
        E: 'Girişimci (Lider)', C: 'Geleneksel (Düzenli)',
      };
      return names[code] || code;
    }));
    topCareerSuggestions.push(...riasec.careerSuggestions.slice(0, 3));
  }

  // Değerlerden baskın özellikler
  if (values) {
    dominantTraits.push(...values.topValues.slice(0, 2).map(v => `${v.name} Odaklı`));
  }

  // Risk profilinden özellik
  if (risk) {
    dominantTraits.push(risk.profileResult.title);
  }

  // Kariyer uyumu metni
  const careerAlignment = buildCareerAlignment(riasec, values, risk);
  const strengthSummary = buildStrengthSummary(riasec, values, risk);
  const developmentSummary = buildDevelopmentSummary(riasec, values, risk);
  const personalitySnapshot = buildPersonalitySnapshot(riasec, values, risk);
  const aiProofCareers = generateAIProofCareers(riasec, values, risk);

  return {
    dominantTraits,
    careerAlignment,
    strengthSummary,
    developmentSummary,
    topCareerSuggestions,
    aiProofCareers,
    personalitySnapshot,
  };
}

function buildCareerAlignment(
  riasec: AnalysisResult | null,
  values: ValuesAnalysisResult | null,
  risk: RiskAnalysisResult | null,
): string {
  const parts: string[] = [];

  if (riasec) {
    parts.push(`RIASEC profili ${riasec.riasecTop3.join('-')} kodlu, ${riasec.strengthAreas.slice(0, 2).join(' ve ')} alanlarında güçlü`);
  }
  if (values) {
    const topVals = values.topValues.slice(0, 2).map(v => v.name).join(' ve ');
    parts.push(`kariyer değerlerinde ${topVals} ön planda`);
  }
  if (risk) {
    parts.push(`risk profilinde ${risk.profileResult.title.toLowerCase()}`);
  }

  return parts.length > 0
    ? parts.join('; ') + '.'
    : 'Henüz yeterli veri yok.';
}

function buildStrengthSummary(
  riasec: AnalysisResult | null,
  values: ValuesAnalysisResult | null,
  risk: RiskAnalysisResult | null,
): string {
  const strengths: string[] = [];

  if (riasec) {
    strengths.push(...riasec.strengthAreas.slice(0, 3));
  }
  if (values) {
    strengths.push(...values.topValues.slice(0, 2).map(v => v.name));
  }
  if (risk) {
    strengths.push(...risk.topDimensions.slice(0, 2).map(d => d.name));
  }

  return strengths.length > 0
    ? `Güçlü yönler: ${strengths.join(', ')}`
    : 'Henüz analiz yapılmadı.';
}

function buildDevelopmentSummary(
  riasec: AnalysisResult | null,
  values: ValuesAnalysisResult | null,
  risk: RiskAnalysisResult | null,
): string {
  const areas: string[] = [];

  if (riasec) {
    areas.push(...riasec.developmentAreas.slice(0, 2));
  }
  if (values) {
    areas.push(...values.bottomValues.slice(0, 2).map(v => v.name));
  }
  if (risk) {
    areas.push(...risk.bottomDimensions.slice(0, 2).map(d => d.name));
  }

  return areas.length > 0
    ? `Gelişim alanları: ${areas.join(', ')}`
    : 'Henüz analiz yapılmadı.';
}

function buildPersonalitySnapshot(
  riasec: AnalysisResult | null,
  values: ValuesAnalysisResult | null,
  risk: RiskAnalysisResult | null,
): string {
  const parts: string[] = [];

  if (riasec) {
    parts.push(riasec.personalityInsights);
  }
  if (values) {
    const topVal = values.topValues[0];
    if (topVal) {
      parts.push(`Kariyer değerlerinde "${topVal.name}" en önemli öncelik.`);
    }
  }
  if (risk) {
    parts.push(risk.description);
  }

  return parts.join(' ') || 'Henüz yeterli veri yok.';
}

/**
 * AI-Proof kariyer önerileri oluştur
 */
function generateAIProofCareers(
  riasec: AnalysisResult | null,
  values: ValuesAnalysisResult | null,
  risk: RiskAnalysisResult | null,
): Array<{ career: string; aiProofScore: number; reason: string }> {
  // Profil özelliklerine göre AI-proof kariyer önerileri
  const careers: Array<{ career: string; aiProofScore: number; reason: string; tags: string[] }> = [
    { career: 'Yapay Zeka Mühendisi', aiProofScore: 95, reason: 'AI teknolojisini geliştiren meslek, otomasyon riski çok düşük', tags: ['I', 'R', 'teknoloji', 'yenilik'] },
    { career: 'Veri Bilimci', aiProofScore: 85, reason: 'Karmaşık veri analizi ve yorumlama insan uzmanlığı gerektirir', tags: ['I', 'C', 'analiz', 'teknoloji'] },
    { career: 'UX/UI Tasarımcı', aiProofScore: 80, reason: 'İnsan psikolojisi ve yaratıcılık gerektiren tasarım işleri', tags: ['A', 'S', 'yaratıcılık', 'empati'] },
    { career: 'Klinik Psikolog', aiProofScore: 92, reason: 'İnsan ilişkileri ve duygusal zeka gerektiren terapi', tags: ['S', 'I', 'empati', 'insanodaklı'] },
    { career: 'Robotik Mühendisi', aiProofScore: 90, reason: 'Fiziksel dünyayla etkileşim ve yaratıcı mühendislik', tags: ['R', 'I', 'teknoloji', 'yenilik'] },
    { career: 'Girişimci / Startup Kurucusu', aiProofScore: 88, reason: 'Vizyon, liderlik ve risk yönetimi insan becerisi gerektirir', tags: ['E', 'risk-taker', 'liderlik', 'yenilik'] },
    { career: 'Eğitim Teknolojisi Uzmanı', aiProofScore: 82, reason: 'Pedagoji ve teknoloji birleşimi, insan dokunuşu gerekli', tags: ['S', 'I', 'eğitim', 'teknoloji'] },
    { career: 'Sürdürülebilirlik Danışmanı', aiProofScore: 85, reason: 'Karmaşık çevresel ve sosyal problemlere bütünsel yaklaşım', tags: ['S', 'I', 'sorumluluk', 'toplum'] },
    { career: 'Siber Güvenlik Uzmanı', aiProofScore: 88, reason: 'Sürekli değişen tehditlerle mücadele yaratıcı düşünme gerektirir', tags: ['I', 'C', 'güvenlik', 'teknoloji'] },
    { career: 'Sağlık Bilişimi Uzmanı', aiProofScore: 86, reason: 'Tıp ve teknoloji kesişimi, insan sağlığı odaklı', tags: ['I', 'S', 'sağlık', 'teknoloji'] },
    { career: 'Yaratıcı Yönetmen', aiProofScore: 78, reason: 'Sanatsal vizyon ve hikaye anlatıcılığı AI ile desteklenir ama yerini alamaz', tags: ['A', 'E', 'yaratıcılık', 'liderlik'] },
    { career: 'Stratejik Planlama Uzmanı', aiProofScore: 82, reason: 'Karmaşık iş stratejileri ve insan dinamikleri analizi', tags: ['E', 'C', 'analiz', 'liderlik'] },
    { career: 'Biyomedikal Mühendisi', aiProofScore: 90, reason: 'Tıp ve mühendislik kesişimi, yenilikçi çözümler', tags: ['R', 'I', 'sağlık', 'yenilik'] },
    { career: 'Sosyal Girişimci', aiProofScore: 87, reason: 'Toplumsal sorunlara yaratıcı çözümler, empati ve liderlik', tags: ['S', 'E', 'toplum', 'sorumluluk'] },
    { career: 'İnsan Kaynakları Stratejisti', aiProofScore: 75, reason: 'İnsan ilişkileri ve organizasyonel davranış uzmanlığı', tags: ['S', 'E', 'empati', 'insanodaklı'] },
  ];

  // Profil etiketlerini topla
  const profileTags: string[] = [];

  if (riasec) {
    profileTags.push(...riasec.riasecTop3);
    if (riasec.bigFive.openness > 60) profileTags.push('yaratıcılık', 'yenilik');
    if (riasec.bigFive.conscientiousness > 60) profileTags.push('sorumluluk');
    if (riasec.bigFive.extraversion > 60) profileTags.push('liderlik');
    if (riasec.bigFive.agreeableness > 60) profileTags.push('empati', 'insanodaklı');
  }

  if (values) {
    values.topValues.slice(0, 3).forEach(v => {
      const valTags: Record<string, string[]> = {
        'Başarı': ['liderlik', 'analiz'],
        'Bağımsızlık': ['yenilik', 'risk-taker'],
        'Yaratıcılık': ['yaratıcılık', 'yenilik'],
        'Yardımseverlik': ['empati', 'insanodaklı', 'toplum'],
        'Güvenlik': ['güvenlik', 'sorumluluk'],
        'Prestij': ['liderlik'],
        'Çeşitlilik': ['yenilik', 'yaratıcılık'],
        'Ekonomik Getiri': ['analiz', 'teknoloji'],
        'Entelektüel Uyarım': ['analiz', 'teknoloji'],
        'Çalışma Ortamı': ['insanodaklı'],
      };
      profileTags.push(...(valTags[v.name] || []));
    });
  }

  if (risk) {
    if (risk.riskType === 'risk-taker') profileTags.push('risk-taker', 'yenilik');
    if (risk.riskType === 'balanced') profileTags.push('analiz');
    if (risk.riskType === 'cautious') profileTags.push('güvenlik', 'sorumluluk');
  }

  // Etiket eşleşmesine göre skora
  const scored = careers.map(c => {
    const matchCount = c.tags.filter(t => profileTags.includes(t)).length;
    return { ...c, matchScore: matchCount };
  });

  // En iyi eşleşenleri döndür
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 5).map(({ career, aiProofScore, reason }) => ({ career, aiProofScore, reason }));
}

function getEmptyInsights(): IntegratedInsights {
  return {
    dominantTraits: [],
    careerAlignment: 'Henüz yeterli veri yok.',
    strengthSummary: 'Henüz analiz yapılmadı.',
    developmentSummary: 'Henüz analiz yapılmadı.',
    topCareerSuggestions: [],
    aiProofCareers: [],
    personalitySnapshot: 'Henüz yeterli veri yok.',
  };
}

/**
 * LLM için birleşik profil bağlamı oluştur
 */
export function getProfileSummaryContext(summary: CareerProfileSummary): string {
  let context = `\n\n## 📊 BÜTÜNLEŞİK KARİYER PROFİLİ ANALİZİ\n`;
  context += `Tamamlanan Etap Sayısı: ${summary.completedStageCount}\n`;
  context += `Toplam Cevaplanan Soru: ${summary.totalAnswerCount}\n`;
  context += `Profil Tamamlanma: %${summary.profileCompleteness}\n\n`;

  if (summary.riasec) {
    const r = summary.riasec;
    context += `### RIASEC Profili\n`;
    context += `R (Gerçekçi): ${r.riasec.R}/100 | I (Araştırmacı): ${r.riasec.I}/100 | A (Sanatsal): ${r.riasec.A}/100\n`;
    context += `S (Sosyal): ${r.riasec.S}/100 | E (Girişimci): ${r.riasec.E}/100 | C (Geleneksel): ${r.riasec.C}/100\n`;
    context += `Baskın Kod: ${r.riasecTop3.join('-')}\n\n`;
    context += `### Big Five Kişilik Profili\n`;
    context += `Deneyime Açıklık: ${r.bigFive.openness}/100 | Sorumluluk: ${r.bigFive.conscientiousness}/100\n`;
    context += `Dışa Dönüklük: ${r.bigFive.extraversion}/100 | Uyumluluk: ${r.bigFive.agreeableness}/100\n`;
    context += `Duygusal Denge: ${r.bigFive.emotionalStability}/100\n`;
    context += `Kişilik Özeti: ${r.personalityInsights}\n\n`;
  }

  if (summary.values) {
    const v = summary.values;
    context += `### Kariyer Değerleri Profili\n`;
    context += `En Önemli Değerler: ${v.topValues.map(val => `${val.name} (${val.score}/100)`).join(', ')}\n`;
    context += `En Düşük Değerler: ${v.bottomValues.map(val => `${val.name} (${val.score}/100)`).join(', ')}\n`;
    context += `Uyumlu Kariyerler: ${v.careerAlignment.slice(0, 5).join(', ')}\n\n`;
  }

  if (summary.risk) {
    const rk = summary.risk;
    context += `### Kariyer Risk Profili\n`;
    context += `Risk Tipi: ${rk.profileResult.title} (Genel Skor: ${rk.overallScore}/100)\n`;
    context += `Güçlü Boyutlar: ${rk.topDimensions.map(d => `${d.name} (${d.score}/100)`).join(', ')}\n`;
    context += `Gelişim Boyutları: ${rk.bottomDimensions.map(d => `${d.name} (${d.score}/100)`).join(', ')}\n`;
    context += `Profil: ${rk.description}\n\n`;
  }

  const insights = summary.integratedInsights;
  context += `### Entegre İçgörüler\n`;
  context += `Baskın Özellikler: ${insights.dominantTraits.join(', ')}\n`;
  context += `Kariyer Uyumu: ${insights.careerAlignment}\n`;
  context += `${insights.strengthSummary}\n`;
  context += `${insights.developmentSummary}\n\n`;

  context += `### AI-Proof Kariyer Önerileri\n`;
  for (const c of insights.aiProofCareers) {
    context += `- ${c.career} (AI-Proof: ${c.aiProofScore}/100) - ${c.reason}\n`;
  }

  context += `\nBu bütünleşik profil verilerini kullanarak kapsamlı, kişiselleştirilmiş ve derinlemesine bir Kariyer Profili Özeti raporu oluştur.\n`;
  context += `Raporda hem güçlü yönleri hem de gelişim alanlarını dengeli bir şekilde ele al.\n`;
  context += `AI-Proof kariyer önerilerini mutlaka dahil et ve her meslek için otomasyon riskini değerlendir.\n`;

  return context;
}
