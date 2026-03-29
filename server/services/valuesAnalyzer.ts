/**
 * Kariyer Değerleri Analiz Motoru
 * 
 * Öğrencilerin kariyer değerlerini 10 boyutta analiz eder.
 * reflektif-web projesindeki Kariyer Değerleri Envanteri'nden uyarlanmıştır.
 * 
 * 10 Değer Boyutu:
 * 1. Maddi Kazanç (financial)
 * 2. İş-Yaşam Dengesi (workLife)
 * 3. Toplumsal Katkı (socialImpact)
 * 4. Yaratıcılık (creativity)
 * 5. Liderlik ve Güç (leadership)
 * 6. Bağımsızlık (independence)
 * 7. Güvenlik ve İstikrar (security)
 * 8. Entelektüel Gelişim (intellectual)
 * 9. Takım Çalışması (teamwork)
 * 10. Prestij ve Tanınırlık (prestige)
 */

export interface ValuesProfile {
  financial: number;      // Maddi Kazanç
  workLife: number;        // İş-Yaşam Dengesi
  socialImpact: number;    // Toplumsal Katkı
  creativity: number;      // Yaratıcılık
  leadership: number;      // Liderlik ve Güç
  independence: number;    // Bağımsızlık
  security: number;        // Güvenlik ve İstikrar
  intellectual: number;    // Entelektüel Gelişim
  teamwork: number;        // Takım Çalışması
  prestige: number;        // Prestij ve Tanınırlık
}

export interface ValuesAnalysisResult {
  profile: ValuesProfile;
  topValues: ValuesValueInfo[];
  bottomValues: ValuesValueInfo[];
  description: string;
  careerAlignment: string[];
  insights: string;
}

export interface ValuesValueInfo {
  key: string;
  name: string;
  score: number;
  description: string;
}

// Değer boyutları açıklamaları
const VALUES_DESCRIPTIONS: Record<keyof ValuesProfile, {
  name: string;
  description: string;
  highDescription: string;
  lowDescription: string;
  alignedCareers: string[];
}> = {
  financial: {
    name: 'Maddi Kazanç',
    description: 'Yüksek gelir ve maddi güvence sağlayan kariyer yollarına yönelim.',
    highDescription: 'Maddi kazanç senin için önemli bir motivasyon kaynağı. Yüksek gelir potansiyeli olan kariyerler seni daha çok motive ediyor.',
    lowDescription: 'Maddi kazanç senin için birincil motivasyon kaynağı değil. Anlamlı bir iş yapmak, yüksek maaştan daha önemli.',
    alignedCareers: ['Finans Yöneticisi', 'Yatırım Bankacısı', 'Girişimci', 'Avukat', 'Cerrah', 'Yazılım Mühendisi', 'Satış Müdürü']
  },
  workLife: {
    name: 'İş-Yaşam Dengesi',
    description: 'Çalışma saatleri, esneklik ve kişisel yaşam arasındaki denge.',
    highDescription: 'İş-yaşam dengesi senin için çok önemli. Esnek çalışma saatleri ve kişisel zamana değer veriyorsun.',
    lowDescription: 'Kariyer hedeflerin için uzun saatler çalışmaya hazırsın. İş-yaşam dengesi şu an için ikincil önceliğin.',
    alignedCareers: ['Öğretmen', 'Kamu Çalışanı', 'Serbest Yazar', 'Uzaktan Çalışan Yazılımcı', 'Kütüphaneci', 'Akademisyen']
  },
  socialImpact: {
    name: 'Toplumsal Katkı',
    description: 'Topluma ve çevreye olumlu katkı sağlama arzusu.',
    highDescription: 'Topluma katkı sağlamak senin için güçlü bir motivasyon. İşinin dünyayı daha iyi bir yer yapmasını istiyorsun.',
    lowDescription: 'Toplumsal katkı senin için doğrudan bir kariyer kriteri değil, ancak bireysel başarı ve gelişim daha ön planda.',
    alignedCareers: ['Sosyal Hizmet Uzmanı', 'Doktor', 'Öğretmen', 'STK Yöneticisi', 'Çevre Mühendisi', 'Psikolog', 'Hemşire']
  },
  creativity: {
    name: 'Yaratıcılık',
    description: 'Yeni fikirler üretme, özgün çözümler geliştirme ve sanatsal ifade.',
    highDescription: 'Yaratıcılık senin en güçlü değerlerinden biri. Özgün fikirler üretmek ve yenilikçi projeler geliştirmek seni motive ediyor.',
    lowDescription: 'Yapılandırılmış ve net görevleri tercih ediyorsun. Belirsizlik yerine somut hedeflerle çalışmak sana daha uygun.',
    alignedCareers: ['Grafik Tasarımcı', 'Mimar', 'Reklamcı', 'Yazar', 'Film Yönetmeni', 'Oyun Geliştiricisi', 'UX Tasarımcısı']
  },
  leadership: {
    name: 'Liderlik ve Güç',
    description: 'Karar verme yetkisi, insanları yönlendirme ve etki alanı oluşturma.',
    highDescription: 'Liderlik etmek ve karar verme yetkisine sahip olmak senin için önemli. İnsanları yönlendirmekten ve sorumluluk almaktan keyif alıyorsun.',
    lowDescription: 'Liderlik pozisyonları yerine uzmanlık alanında derinleşmeyi tercih ediyorsun. Takımda destek rolü sana daha uygun.',
    alignedCareers: ['CEO/Genel Müdür', 'Proje Yöneticisi', 'Okul Müdürü', 'Siyasetçi', 'Askeri Komutan', 'Departman Müdürü']
  },
  independence: {
    name: 'Bağımsızlık',
    description: 'Kendi kararlarını verme, özerk çalışma ve serbest hareket etme.',
    highDescription: 'Bağımsız çalışmak ve kendi kararlarını vermek senin için çok önemli. Otonom bir çalışma ortamı seni en verimli yapıyor.',
    lowDescription: 'Yapılandırılmış bir ortamda, net yönergelerle çalışmayı tercih ediyorsun. Takım desteği ve rehberlik sana güven veriyor.',
    alignedCareers: ['Serbest Danışman', 'Girişimci', 'Freelance Tasarımcı', 'Araştırmacı', 'Serbest Avukat', 'Fotoğrafçı']
  },
  security: {
    name: 'Güvenlik ve İstikrar',
    description: 'İş güvencesi, düzenli gelir ve kariyerde öngörülebilirlik.',
    highDescription: 'İş güvencesi ve istikrar senin için öncelikli. Düzenli gelir ve öngörülebilir bir kariyer yolu seni rahatlatıyor.',
    lowDescription: 'Risk almaktan çekinmiyorsun. Güvenlik yerine büyüme fırsatlarını tercih ediyorsun.',
    alignedCareers: ['Devlet Memuru', 'Bankacı', 'Muhasebeci', 'Hemşire', 'Öğretmen', 'Kamu Yöneticisi', 'Eczacı']
  },
  intellectual: {
    name: 'Entelektüel Gelişim',
    description: 'Sürekli öğrenme, araştırma yapma ve bilgi üretme tutkusu.',
    highDescription: 'Sürekli öğrenmek ve entelektüel olarak gelişmek senin için vazgeçilmez. Araştırma ve bilgi üretimi seni motive ediyor.',
    lowDescription: 'Teorik bilgi yerine pratik uygulama ve somut sonuçlar seni daha çok motive ediyor.',
    alignedCareers: ['Akademisyen', 'Araştırmacı', 'Bilim İnsanı', 'Doktor', 'Mühendis', 'Veri Bilimci', 'Filozof']
  },
  teamwork: {
    name: 'Takım Çalışması',
    description: 'Birlikte çalışma, işbirliği yapma ve ortak hedeflere ulaşma.',
    highDescription: 'Takım çalışması senin için önemli. İnsanlarla birlikte çalışmak, fikir alışverişi yapmak ve ortak hedeflere ulaşmak seni motive ediyor.',
    lowDescription: 'Bireysel çalışmayı tercih ediyorsun. Kendi hızında, kendi yöntemleriyle ilerlemek sana daha uygun.',
    alignedCareers: ['İnsan Kaynakları Uzmanı', 'Proje Yöneticisi', 'Öğretmen', 'Spor Antrenörü', 'Hemşire', 'Sosyal Hizmet Uzmanı']
  },
  prestige: {
    name: 'Prestij ve Tanınırlık',
    description: 'Toplumda saygınlık, profesyonel itibar ve tanınma.',
    highDescription: 'Prestij ve tanınırlık senin için önemli bir motivasyon. Toplumda saygın bir konuma sahip olmak seni motive ediyor.',
    lowDescription: 'Dışarıdan gelen onay yerine iç motivasyonun ve kişisel tatminin daha önemli.',
    alignedCareers: ['Doktor', 'Avukat', 'Profesör', 'Diplomat', 'Yargıç', 'CEO', 'Mimar']
  }
};

// Soru-boyut eşleştirme haritası (soru sırası → değer boyutu)
// Her yaş grubu için 30 soru, 3'er soru her boyut için
const QUESTION_VALUE_MAP: (keyof ValuesProfile)[] = [
  'financial', 'financial', 'financial',           // Q1-3
  'workLife', 'workLife', 'workLife',               // Q4-6
  'socialImpact', 'socialImpact', 'socialImpact',  // Q7-9
  'creativity', 'creativity', 'creativity',         // Q10-12
  'leadership', 'leadership', 'leadership',         // Q13-15
  'independence', 'independence', 'independence',    // Q16-18
  'security', 'security', 'security',               // Q19-21
  'intellectual', 'intellectual', 'intellectual',    // Q22-24
  'teamwork', 'teamwork', 'teamwork',               // Q25-27
  'prestige', 'prestige', 'prestige',               // Q28-30
];

/**
 * Likert cevaplarından değerler profili çıkar
 * Likert ölçeği: 1=Kesinlikle Katılmıyorum ... 5=Kesinlikle Katılıyorum
 */
export function analyzeValues(answers: Array<{ question: string; answer: string }>, questionOrder?: number[]): ValuesProfile {
  const profile: ValuesProfile = {
    financial: 0, workLife: 0, socialImpact: 0, creativity: 0,
    leadership: 0, independence: 0, security: 0, intellectual: 0,
    teamwork: 0, prestige: 0
  };

  const counts: Record<keyof ValuesProfile, number> = {
    financial: 0, workLife: 0, socialImpact: 0, creativity: 0,
    leadership: 0, independence: 0, security: 0, intellectual: 0,
    teamwork: 0, prestige: 0
  };

  answers.forEach((item, index) => {
    if (index >= QUESTION_VALUE_MAP.length) return;
    
    const dimension = QUESTION_VALUE_MAP[index];
    const score = parseLikertScore(item.answer);
    
    if (score > 0) {
      profile[dimension] += score;
      counts[dimension] += 1;
    }
  });

  // Normalize: her boyut için ortalama al ve 0-100 ölçeğine dönüştür
  for (const key of Object.keys(profile) as Array<keyof ValuesProfile>) {
    if (counts[key] > 0) {
      const avg = profile[key] / counts[key]; // 1-5 arası ortalama
      profile[key] = Math.round(((avg - 1) / 4) * 100); // 0-100 ölçeğine
    }
  }

  return profile;
}

/**
 * Likert cevabını sayısal skora dönüştür
 */
function parseLikertScore(answer: string): number {
  const normalized = (answer || '').trim().toLowerCase();
  
  // Direkt sayısal değer
  const num = parseInt(normalized);
  if (!isNaN(num) && num >= 1 && num <= 5) return num;
  
  // Metin bazlı eşleştirme
  const likertMap: Record<string, number> = {
    'kesinlikle katılmıyorum': 1,
    'katılmıyorum': 2,
    'kararsızım': 3,
    'katılıyorum': 4,
    'kesinlikle katılıyorum': 5,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  };
  
  return likertMap[normalized] || 0;
}

/**
 * Değerler profilinden en güçlü ve en zayıf değerleri çıkar
 */
export function getTopAndBottomValues(profile: ValuesProfile, count: number = 3): {
  top: ValuesValueInfo[];
  bottom: ValuesValueInfo[];
} {
  const entries = Object.entries(profile) as [keyof ValuesProfile, number][];
  const sorted = entries.sort(([, a], [, b]) => b - a);

  const mapToInfo = ([key, score]: [keyof ValuesProfile, number]): ValuesValueInfo => ({
    key,
    name: VALUES_DESCRIPTIONS[key].name,
    score,
    description: score >= 60 
      ? VALUES_DESCRIPTIONS[key].highDescription 
      : VALUES_DESCRIPTIONS[key].lowDescription,
  });

  return {
    top: sorted.slice(0, count).map(mapToInfo),
    bottom: sorted.slice(-count).reverse().map(mapToInfo),
  };
}

/**
 * Değerler profilinden kariyer uyumu önerileri oluştur
 */
export function getValuesAlignedCareers(profile: ValuesProfile): string[] {
  const entries = Object.entries(profile) as [keyof ValuesProfile, number][];
  const top3 = entries.sort(([, a], [, b]) => b - a).slice(0, 3);
  
  const careers: string[] = [];
  for (const [key] of top3) {
    careers.push(...VALUES_DESCRIPTIONS[key].alignedCareers.slice(0, 3));
  }
  
  return Array.from(new Set(careers));
}

/**
 * Tam değerler analizi sonucu oluştur
 */
export function performValuesAnalysis(answers: Array<{ question: string; answer: string }>): ValuesAnalysisResult {
  const profile = analyzeValues(answers);
  const { top, bottom } = getTopAndBottomValues(profile);
  const careers = getValuesAlignedCareers(profile);

  // Detaylı açıklama oluştur
  const topNames = top.map(v => v.name);
  const description = `## Kariyer Değerleri Profili

Senin en önemli kariyer değerlerin: **${topNames.join(', ')}**

${top.map(v => `### ${v.name} (Skor: ${v.score}/100)
${v.description}`).join('\n\n')}

### Daha Az Öncelikli Değerler
${bottom.map(v => `- **${v.name}** (${v.score}/100): ${v.description}`).join('\n')}`;

  const insights = `Kariyer değerlerin incelendiğinde, ${topNames[0]} ve ${topNames[1]} boyutlarının ön plana çıktığı görülüyor. Bu değer profili, ${careers.slice(0, 4).join(', ')} gibi kariyer alanlarıyla yüksek uyum gösteriyor. Kariyer seçimlerinde bu değerlere uygun pozisyonları tercih etmen, uzun vadede iş tatminini ve motivasyonunu artıracaktır.`;

  return {
    profile,
    topValues: top,
    bottomValues: bottom,
    description,
    careerAlignment: careers,
    insights,
  };
}

/**
 * Değerler profilini dışa aktarılabilir formata dönüştür (rapor için)
 */
export function getValuesContext(analysis: ValuesAnalysisResult): string {
  const profileEntries = Object.entries(analysis.profile) as [keyof ValuesProfile, number][];
  const profileLines = profileEntries.map(([key, score]) => 
    `${VALUES_DESCRIPTIONS[key].name}: ${score}/100`
  );

  return `\n\n## Kariyer Değerleri Analiz Sonuçları (Otomatik Hesaplanmış)
${profileLines.join('\n')}

En önemli değerler: ${analysis.topValues.map(v => v.name).join(', ')}
Daha az öncelikli değerler: ${analysis.bottomValues.map(v => v.name).join(', ')}
Değer uyumlu kariyer alanları: ${analysis.careerAlignment.join(', ')}

Lütfen bu değer profilini de raporda değerlendir ve kariyer önerilerini öğrencinin değer öncelikleriyle uyumlu hale getir.`;
}
