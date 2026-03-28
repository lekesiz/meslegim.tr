/**
 * RIASEC & Kişilik Analiz Motoru
 * 
 * Öğrencilerin cevaplarını RIASEC modeline göre analiz eder.
 * RIASEC: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
 * 
 * Reflektif-web projesinden uyarlanmıştır.
 */

export interface RIASECProfile {
  R: number; // Realistic - Gerçekçi
  I: number; // Investigative - Araştırmacı
  A: number; // Artistic - Sanatsal
  S: number; // Social - Sosyal
  E: number; // Enterprising - Girişimci
  C: number; // Conventional - Geleneksel
}

export interface PersonalityProfile {
  openness: number;       // Deneyime açıklık
  conscientiousness: number; // Sorumluluk
  extraversion: number;   // Dışa dönüklük
  agreeableness: number;  // Uyumluluk
  neuroticism: number;    // Duygusal denge
}

export interface AnalysisResult {
  riasec: RIASECProfile;
  riasecTop3: string[];
  riasecDescription: string;
  personalityInsights: string;
  careerSuggestions: string[];
  strengthAreas: string[];
  developmentAreas: string[];
}

// RIASEC boyut açıklamaları (Türkçe)
const RIASEC_DESCRIPTIONS: Record<string, { name: string; description: string; careers: string[] }> = {
  R: {
    name: 'Gerçekçi (Realistic)',
    description: 'Pratik, el becerisi gerektiren, somut sonuçlar üreten işleri tercih edersin. Araç-gereç kullanmayı, doğada çalışmayı ve fiziksel aktiviteleri seversin.',
    careers: ['Mühendislik', 'Mimarlık', 'Pilotluk', 'Veterinerlik', 'Spor Eğitmenliği', 'Teknisyenlik', 'Çiftçilik/Tarım']
  },
  I: {
    name: 'Araştırmacı (Investigative)',
    description: 'Analitik düşünmeyi, araştırmayı ve problem çözmeyi seversin. Bilimsel konulara meraklısın ve derinlemesine analiz yapmaktan keyif alırsın.',
    careers: ['Bilim İnsanı', 'Doktorluk', 'Yazılım Geliştirici', 'Veri Analisti', 'Akademisyen', 'Eczacılık', 'Biyoteknoloji']
  },
  A: {
    name: 'Sanatsal (Artistic)',
    description: 'Yaratıcılığını kullanmayı, özgün fikirler üretmeyi ve kendini ifade etmeyi seversin. Estetik duyarlılığın yüksek.',
    careers: ['Grafik Tasarımcı', 'Yazar/Editör', 'Müzisyen', 'Film Yönetmeni', 'Mimar', 'Fotoğrafçı', 'İç Mimar']
  },
  S: {
    name: 'Sosyal (Social)',
    description: 'İnsanlarla çalışmayı, yardım etmeyi ve iletişim kurmayı seversin. Empati yeteneğin güçlü ve takım çalışmasında başarılısın.',
    careers: ['Öğretmenlik', 'Psikolojik Danışmanlık', 'Sosyal Hizmet', 'Hemşirelik', 'İnsan Kaynakları', 'Halkla İlişkiler', 'Rehberlik']
  },
  E: {
    name: 'Girişimci (Enterprising)',
    description: 'Liderlik etmeyi, ikna etmeyi ve risk almayı seversin. Hedef odaklısın ve insanları yönlendirmekten keyif alırsın.',
    careers: ['Girişimcilik', 'Pazarlama Yöneticisi', 'Avukatlık', 'Satış Müdürü', 'Siyasetçi', 'Proje Yöneticisi', 'CEO/Yönetici']
  },
  C: {
    name: 'Geleneksel (Conventional)',
    description: 'Düzenli, sistematik ve detay odaklı çalışmayı seversin. Kurallar çerçevesinde çalışmaktan ve veri yönetiminden keyif alırsın.',
    careers: ['Muhasebeci', 'Bankacı', 'İstatistikçi', 'Kütüphaneci', 'Lojistik Uzmanı', 'Kalite Kontrol', 'Devlet Memuru']
  }
};

/**
 * Cevaplardan RIASEC profili çıkar
 * Basitleştirilmiş versiyon - cevap metinlerindeki anahtar kelimelere göre skorlama
 */
export function analyzeRIASEC(answers: Array<{ question: string; answer: string }>): RIASECProfile {
  const profile: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // Anahtar kelime-boyut eşlemeleri
  const keywordMap: Record<string, keyof RIASECProfile> = {
    // Realistic
    'spor': 'R', 'beden eğitimi': 'R', 'doğa': 'R', 'hayvan': 'R', 'atölye': 'R',
    'laboratuvar': 'R', 'üretim': 'R', 'saha': 'R', 'dışarıda': 'R', 'fiziksel': 'R',
    'antrenman': 'R', 'el sanatları': 'R', 'tamir': 'R', 'mekanik': 'R',
    // Investigative
    'matematik': 'I', 'fizik': 'I', 'kimya': 'I', 'biyoloji': 'I', 'araştırma': 'I',
    'analiz': 'I', 'bulmaca': 'I', 'bilim': 'I', 'deney': 'I', 'veri': 'I',
    'istatistik': 'I', 'problem çöz': 'I', 'kodlama': 'I', 'bilişim': 'I',
    // Artistic
    'resim': 'A', 'müzik': 'A', 'sanat': 'A', 'yaratıcı': 'A', 'tasarım': 'A',
    'fotoğraf': 'A', 'video': 'A', 'içerik üret': 'A', 'hikaye': 'A', 'edebiyat': 'A',
    'sahne': 'A', 'stüdyo': 'A', 'görsel': 'A', 'estetik': 'A',
    // Social
    'yardım': 'S', 'dinle': 'S', 'öğret': 'S', 'eğitim': 'S', 'hastane': 'S',
    'sağlık': 'S', 'insanlar': 'S', 'arkadaş': 'S', 'topluluk': 'S', 'gönüllü': 'S',
    'empati': 'S', 'arabulucu': 'S', 'uyum': 'S', 'takım': 'S',
    // Enterprising
    'lider': 'E', 'organize': 'E', 'karar': 'E', 'girişim': 'E', 'iş insanı': 'E',
    'yönet': 'E', 'ikna': 'E', 'satış': 'E', 'pazarlama': 'E', 'risk': 'E',
    'rekabet': 'E', 'strateji': 'E', 'hedef': 'E',
    // Conventional
    'düzen': 'C', 'plan': 'C', 'detay': 'C', 'kural': 'C', 'muhasebe': 'C',
    'ofis': 'C', 'masa başı': 'C', 'bilgisayar': 'C', 'memur': 'C', 'kamu': 'C',
    'sistematik': 'C', 'titiz': 'C', 'takipçi': 'C',
  };

  for (const { answer } of answers) {
    const lowerAnswer = (answer || '').toLowerCase();
    for (const [keyword, dimension] of Object.entries(keywordMap)) {
      if (lowerAnswer.includes(keyword)) {
        profile[dimension] += 1;
      }
    }
  }

  // Normalize to 0-100 scale
  const maxScore = Math.max(...Object.values(profile), 1);
  for (const key of Object.keys(profile) as Array<keyof RIASECProfile>) {
    profile[key] = Math.round((profile[key] / maxScore) * 100);
  }

  return profile;
}

/**
 * RIASEC profilinden en güçlü 3 boyutu çıkar
 */
export function getTopRIASEC(profile: RIASECProfile, count: number = 3): string[] {
  return Object.entries(profile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([key]) => key);
}

/**
 * RIASEC profilinden detaylı açıklama oluştur
 */
export function generateRIASECDescription(profile: RIASECProfile): string {
  const top3 = getTopRIASEC(profile);
  const descriptions = top3.map(code => {
    const dim = RIASEC_DESCRIPTIONS[code];
    return `**${dim.name}** (Skor: ${profile[code as keyof RIASECProfile]}/100): ${dim.description}`;
  });

  return `## RIASEC Profil Analizi\n\nSenin en güçlü 3 boyutun: **${top3.map(c => RIASEC_DESCRIPTIONS[c].name).join(', ')}**\n\n${descriptions.join('\n\n')}`;
}

/**
 * RIASEC profilinden kariyer önerileri oluştur
 */
export function getRIASECCareers(profile: RIASECProfile): string[] {
  const top3 = getTopRIASEC(profile);
  const careers: string[] = [];
  
  for (const code of top3) {
    careers.push(...RIASEC_DESCRIPTIONS[code].careers.slice(0, 3));
  }

  return Array.from(new Set(careers)); // Tekrarları kaldır
}

/**
 * Tam analiz sonucu oluştur
 */
export function performFullAnalysis(answers: Array<{ question: string; answer: string }>): AnalysisResult {
  const riasec = analyzeRIASEC(answers);
  const top3 = getTopRIASEC(riasec);
  const description = generateRIASECDescription(riasec);
  const careers = getRIASECCareers(riasec);

  // Güçlü alanları belirle
  const strengthAreas = top3.map(code => RIASEC_DESCRIPTIONS[code].name);

  // Gelişim alanlarını belirle (en düşük 2 boyut)
  const bottom2 = Object.entries(riasec)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([key]) => RIASEC_DESCRIPTIONS[key].name);

  return {
    riasec,
    riasecTop3: top3,
    riasecDescription: description,
    personalityInsights: `Kişilik profilin ${strengthAreas.join(' ve ')} boyutlarında güçlü. Bu, ${careers.slice(0, 3).join(', ')} gibi alanlarda başarılı olabileceğini gösteriyor.`,
    careerSuggestions: careers,
    strengthAreas,
    developmentAreas: bottom2,
  };
}
