/**
 * Kariyer Risk Analizi Motoru
 * 
 * Öğrencilerin kariyer risk profilini 5 boyutta analiz eder.
 * reflektif-web projesindeki Kariyer Risk Analizi'nden uyarlanmış ve genişletilmiştir.
 * 
 * 5 Risk Boyutu:
 * 1. Değişim Toleransı (changeTolerance) - Yeni durumlara uyum sağlama
 * 2. Belirsizlik Yönetimi (uncertaintyMgmt) - Belirsizlik altında karar verme
 * 3. Girişimcilik Eğilimi (entrepreneurial) - Risk alma ve girişim ruhu
 * 4. Kariyer Esnekliği (careerFlexibility) - Farklı kariyer yollarına açıklık
 * 5. Karar Alma Tarzı (decisionStyle) - Hızlı/analitik/temkinli karar verme
 * 
 * Soru tipi: multiple_choice (3 seçenek: risk-taker=3, balanced=2, cautious=1)
 */

export interface RiskProfile {
  changeTolerance: number;     // Değişim Toleransı
  uncertaintyMgmt: number;     // Belirsizlik Yönetimi
  entrepreneurial: number;     // Girişimcilik Eğilimi
  careerFlexibility: number;   // Kariyer Esnekliği
  decisionStyle: number;       // Karar Alma Tarzı
}

export type RiskType = 'risk-taker' | 'balanced' | 'cautious';

export interface RiskProfileResult {
  type: RiskType;
  title: string;
  description: string;
  strengths: string[];
  watchOuts: string[];
  recommendations: string[];
}

export interface RiskAnalysisResult {
  profile: RiskProfile;
  overallScore: number;        // 0-100 genel risk skoru
  riskType: RiskType;
  profileResult: RiskProfileResult;
  topDimensions: RiskDimensionInfo[];
  bottomDimensions: RiskDimensionInfo[];
  description: string;
  insights: string;
  careerRecommendations: string[];
}

export interface RiskDimensionInfo {
  key: string;
  name: string;
  score: number;
  description: string;
}

// Risk profili açıklamaları
const RISK_PROFILES: Record<RiskType, RiskProfileResult> = {
  'risk-taker': {
    type: 'risk-taker',
    title: 'Cesur Karar Verici',
    description: 'Yüksek risk toleransına sahipsin. Fırsatları değerlendirmekte hızlısın ve değişimden korkmuyorsun. Girişimcilik ruhu taşıyorsun. Yeni deneyimlere açık, cesur ve kararlı bir kariyer yaklaşımın var.',
    strengths: [
      'Hızlı karar alma yeteneği',
      'Fırsatları görebilme ve değerlendirebilme',
      'Değişime ve yeniliğe açıklık',
      'Girişimci ruh ve liderlik potansiyeli',
      'Belirsizlik altında hareket edebilme',
    ],
    watchOuts: [
      'Aceleci kararlar verme riski',
      'Finansal güvenliği göz ardı etme eğilimi',
      'Detaylı analiz yapmadan hareket etme',
      'Uzun vadeli planlamayı ihmal etme',
    ],
    recommendations: [
      'Girişimcilik, startup ekosistemi veya inovasyon odaklı roller',
      'Satış, pazarlama veya iş geliştirme pozisyonları',
      'Proje yönetimi veya danışmanlık kariyerleri',
      'Serbest çalışma veya freelance iş modelleri',
    ],
  },
  'balanced': {
    type: 'balanced',
    title: 'Dengeli Stratejist',
    description: 'Risk ve güvenlik arasında sağlıklı bir denge kurabiliyorsun. Kararlarını verirken hem fırsatları hem de riskleri değerlendiriyorsun. Analitik düşünme yeteneğin güçlü ve stratejik planlama yapabiliyorsun.',
    strengths: [
      'Analitik ve stratejik düşünme',
      'Dengeli risk-fayda değerlendirmesi',
      'Uyum sağlama ve esneklik',
      'Hem bireysel hem takım çalışmasına yatkınlık',
      'Planlı ve sistematik yaklaşım',
    ],
    watchOuts: [
      'Karar sürecini uzatma eğilimi',
      'Mükemmel zamanlamayı bekleme',
      'Bazı fırsatları kaçırma riski',
      'Aşırı analiz yapma (analysis paralysis)',
    ],
    recommendations: [
      'Proje yönetimi veya program koordinatörlüğü',
      'Danışmanlık veya strateji rolleri',
      'Finans veya risk yönetimi alanları',
      'Eğitim ve mentorluk pozisyonları',
    ],
  },
  'cautious': {
    type: 'cautious',
    title: 'Temkinli Planlayıcı',
    description: 'Güvenlik ve istikrar senin için öncelikli. Kararlarını dikkatlice alır, riskleri minimize etmeye çalışırsın. Detaylı araştırma ve uzun vadeli düşünme yeteneğin güçlü. Finansal disiplin ve planlama konusunda başarılısın.',
    strengths: [
      'Detaylı araştırma ve analiz yeteneği',
      'Güçlü risk yönetimi becerisi',
      'Uzun vadeli düşünme ve planlama',
      'Finansal disiplin ve tutarlılık',
      'Güvenilir ve istikrarlı çalışma tarzı',
    ],
    watchOuts: [
      'Aşırı temkinli olma ve fırsatları kaçırma',
      'Konfor alanında kalma eğilimi',
      'Değişime direnç gösterme',
      'Yenilikçi fikirlere kapalı olma riski',
    ],
    recommendations: [
      'Kamu sektörü veya büyük kurumsal yapılar',
      'Muhasebe, denetim veya hukuk alanları',
      'Kalite kontrol veya uyum (compliance) rolleri',
      'Akademik kariyer veya araştırma pozisyonları',
    ],
  },
};

// Risk boyutları açıklamaları
const RISK_DIMENSIONS: Record<keyof RiskProfile, {
  name: string;
  highDesc: string;
  lowDesc: string;
}> = {
  changeTolerance: {
    name: 'Değişim Toleransı',
    highDesc: 'Değişime çok açıksın. Yeni durumlar, ortamlar ve koşullar seni heyecanlandırıyor. Rutinden sıkılıyorsun ve sürekli yenilik arıyorsun.',
    lowDesc: 'İstikrar ve süreklilik senin için önemli. Alışkın olduğun ortamlarda daha verimli çalışıyorsun. Değişimlere uyum sağlamak zaman alabiliyor.',
  },
  uncertaintyMgmt: {
    name: 'Belirsizlik Yönetimi',
    highDesc: 'Belirsizlik altında rahat karar verebiliyorsun. Tüm bilgiye sahip olmadan da harekete geçebiliyorsun. Stresli durumlarda soğukkanlılığını koruyorsun.',
    lowDesc: 'Net ve kesin bilgilerle çalışmayı tercih ediyorsun. Belirsiz durumlarda karar vermekte zorlanabiliyorsun. Detaylı bilgi ve analiz seni rahatlatıyor.',
  },
  entrepreneurial: {
    name: 'Girişimcilik Eğilimi',
    highDesc: 'Güçlü bir girişimcilik ruhun var. Kendi işini kurma, bağımsız çalışma ve yenilikçi projeler geliştirme seni motive ediyor.',
    lowDesc: 'Yapılandırılmış bir çalışma ortamını tercih ediyorsun. Düzenli gelir ve iş güvencesi senin için daha önemli. Takım içinde çalışmak sana güven veriyor.',
  },
  careerFlexibility: {
    name: 'Kariyer Esnekliği',
    highDesc: 'Farklı kariyer yollarına açıksın. Sektör değiştirmek, yeni beceriler öğrenmek ve farklı roller denemek seni heyecanlandırıyor.',
    lowDesc: 'Belirli bir alanda uzmanlaşmayı tercih ediyorsun. Kariyer yolunda tutarlılık ve derinlik senin için önemli.',
  },
  decisionStyle: {
    name: 'Karar Alma Tarzı',
    highDesc: 'Hızlı ve sezgisel karar verme eğiliminde olabilirsin. Fırsatları hızla değerlendiriyorsun ama bazen detayları atlayabilirsin.',
    lowDesc: 'Dikkatli ve analitik bir karar alma tarzın var. Her seçeneği detaylıca değerlendiriyorsun. Bu bazen karar sürecini uzatabilir.',
  },
};

// Soru-boyut eşleştirme haritası (10 soru, her boyut için 2 soru)
const QUESTION_RISK_MAP: (keyof RiskProfile)[] = [
  'changeTolerance', 'changeTolerance',       // Q1-2
  'uncertaintyMgmt', 'uncertaintyMgmt',        // Q3-4
  'entrepreneurial', 'entrepreneurial',        // Q5-6
  'careerFlexibility', 'careerFlexibility',    // Q7-8
  'decisionStyle', 'decisionStyle',            // Q9-10
];

/**
 * Cevaplardan risk skoru çıkar
 * Seçenekler: risk-taker seçenek (3 puan), balanced (2 puan), cautious (1 puan)
 */
function parseRiskScore(answer: string): number {
  const normalized = (answer || '').trim().toLowerCase();

  // Direkt sayısal değer (1-3)
  const num = parseInt(normalized);
  if (!isNaN(num) && num >= 1 && num <= 3) return num;

  // Seçenek sırası bazlı (A/B/C veya 1./2./3.)
  if (normalized === 'a' || normalized.startsWith('1.') || normalized.startsWith('a)')) return 3;
  if (normalized === 'b' || normalized.startsWith('2.') || normalized.startsWith('b)')) return 2;
  if (normalized === 'c' || normalized.startsWith('3.') || normalized.startsWith('c)')) return 1;

  // Metin bazlı anahtar kelime eşleştirme
  const riskKeywords = ['hemen', 'kesinlikle', 'fırsat', 'cesur', 'hızlı', 'risk', 'kabul'];
  const balancedKeywords = ['değerlendir', 'araştır', 'önce', 'analiz', 'düşün', 'karşılaştır'];
  const cautiousKeywords = ['güvenli', 'sabret', 'bekle', 'mevcut', 'rahat', 'istikrar', 'düşük'];

  let riskScore = 0;
  let balancedScore = 0;
  let cautiousScore = 0;

  for (const kw of riskKeywords) {
    if (normalized.includes(kw)) riskScore++;
  }
  for (const kw of balancedKeywords) {
    if (normalized.includes(kw)) balancedScore++;
  }
  for (const kw of cautiousKeywords) {
    if (normalized.includes(kw)) cautiousScore++;
  }

  if (riskScore > balancedScore && riskScore > cautiousScore) return 3;
  if (balancedScore > cautiousScore) return 2;
  if (cautiousScore > 0) return 1;

  return 2; // Varsayılan: balanced
}

/**
 * Cevaplardan risk profili çıkar
 */
export function analyzeRisk(answers: Array<{ question: string; answer: string }>): RiskProfile {
  const profile: RiskProfile = {
    changeTolerance: 0,
    uncertaintyMgmt: 0,
    entrepreneurial: 0,
    careerFlexibility: 0,
    decisionStyle: 0,
  };

  const counts: Record<keyof RiskProfile, number> = {
    changeTolerance: 0,
    uncertaintyMgmt: 0,
    entrepreneurial: 0,
    careerFlexibility: 0,
    decisionStyle: 0,
  };

  answers.forEach((item, index) => {
    if (index >= QUESTION_RISK_MAP.length) return;

    const dimension = QUESTION_RISK_MAP[index];
    const score = parseRiskScore(item.answer);

    if (score > 0) {
      profile[dimension] += score;
      counts[dimension] += 1;
    }
  });

  // Normalize: her boyut için ortalama al ve 0-100 ölçeğine dönüştür
  for (const key of Object.keys(profile) as Array<keyof RiskProfile>) {
    if (counts[key] > 0) {
      const avg = profile[key] / counts[key]; // 1-3 arası ortalama
      profile[key] = Math.round(((avg - 1) / 2) * 100); // 0-100 ölçeğine
    }
  }

  return profile;
}

/**
 * Genel risk skorunu hesapla
 */
export function calculateOverallRiskScore(profile: RiskProfile): number {
  const values = Object.values(profile);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/**
 * Risk tipini belirle
 */
export function determineRiskType(overallScore: number): RiskType {
  if (overallScore >= 70) return 'risk-taker';
  if (overallScore >= 40) return 'balanced';
  return 'cautious';
}

/**
 * En güçlü ve en zayıf boyutları çıkar
 */
export function getTopAndBottomDimensions(profile: RiskProfile, count: number = 2): {
  top: RiskDimensionInfo[];
  bottom: RiskDimensionInfo[];
} {
  const entries = Object.entries(profile) as [keyof RiskProfile, number][];
  const sorted = entries.sort(([, a], [, b]) => b - a);

  const mapToInfo = ([key, score]: [keyof RiskProfile, number]): RiskDimensionInfo => ({
    key,
    name: RISK_DIMENSIONS[key].name,
    score,
    description: score >= 50
      ? RISK_DIMENSIONS[key].highDesc
      : RISK_DIMENSIONS[key].lowDesc,
  });

  return {
    top: sorted.slice(0, count).map(mapToInfo),
    bottom: sorted.slice(-count).reverse().map(mapToInfo),
  };
}

/**
 * Tam risk analizi sonucu oluştur
 */
export function performRiskAnalysis(answers: Array<{ question: string; answer: string }>): RiskAnalysisResult {
  const profile = analyzeRisk(answers);
  const overallScore = calculateOverallRiskScore(profile);
  const riskType = determineRiskType(overallScore);
  const profileResult = RISK_PROFILES[riskType];
  const { top, bottom } = getTopAndBottomDimensions(profile);

  const description = `## Kariyer Risk Profili

**Genel Risk Skoru:** ${overallScore}/100
**Profil Tipi:** ${profileResult.title}

${profileResult.description}

### Güçlü Yönlerin
${profileResult.strengths.map(s => `- ${s}`).join('\n')}

### Dikkat Edilmesi Gerekenler
${profileResult.watchOuts.map(w => `- ${w}`).join('\n')}

### Risk Boyutları Detayı
${top.map(d => `**${d.name}** (${d.score}/100): ${d.description}`).join('\n\n')}

### Daha Az Belirgin Boyutlar
${bottom.map(d => `- **${d.name}** (${d.score}/100): ${d.description}`).join('\n')}`;

  const insights = `Kariyer risk profilin incelendiğinde, ${profileResult.title} kategorisinde yer aldığın görülüyor. ${top[0].name} ve ${top[1].name} boyutlarında güçlü bir profil çiziyorsun. Bu profil, ${profileResult.recommendations.slice(0, 3).join(', ')} gibi kariyer alanlarıyla uyumlu. Kariyer planlamasında bu risk profilini göz önünde bulundurman, daha bilinçli ve tatmin edici kararlar almana yardımcı olacaktır.`;

  return {
    profile,
    overallScore,
    riskType,
    profileResult,
    topDimensions: top,
    bottomDimensions: bottom,
    description,
    insights,
    careerRecommendations: profileResult.recommendations,
  };
}

/**
 * Risk profilini rapor context'i olarak dışa aktar
 */
export function getRiskContext(analysis: RiskAnalysisResult): string {
  const profileEntries = Object.entries(analysis.profile) as [keyof RiskProfile, number][];
  const profileLines = profileEntries.map(([key, score]) =>
    `${RISK_DIMENSIONS[key].name}: ${score}/100`
  );

  return `\n\n## Kariyer Risk Analiz Sonuçları (Otomatik Hesaplanmış)
Genel Risk Skoru: ${analysis.overallScore}/100
Risk Profili: ${analysis.profileResult.title}

${profileLines.join('\n')}

Güçlü boyutlar: ${analysis.topDimensions.map(d => d.name).join(', ')}
Dikkat edilecek boyutlar: ${analysis.bottomDimensions.map(d => d.name).join(', ')}
Kariyer önerileri: ${analysis.careerRecommendations.join(', ')}

Lütfen bu risk profilini de raporda değerlendir ve kariyer önerilerini öğrencinin risk toleransıyla uyumlu hale getir.`;
}
