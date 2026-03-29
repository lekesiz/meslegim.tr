/**
 * RIASEC & Big Five Kişilik Analiz Motoru
 * 
 * Öğrencilerin cevaplarını RIASEC ve Big Five modellerine göre analiz eder.
 * RIASEC: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
 * Big Five: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
 * 
 * reflektif-web projesinden uyarlanmış ve genişletilmiştir.
 */

export interface RIASECProfile {
  R: number; // Realistic - Gerçekçi
  I: number; // Investigative - Araştırmacı
  A: number; // Artistic - Sanatsal
  S: number; // Social - Sosyal
  E: number; // Enterprising - Girişimci
  C: number; // Conventional - Geleneksel
}

export interface BigFiveProfile {
  openness: number;          // Deneyime Açıklık
  conscientiousness: number; // Sorumluluk
  extraversion: number;      // Dışa Dönüklük
  agreeableness: number;     // Uyumluluk
  emotionalStability: number; // Duygusal Denge (ters neuroticism)
}

export interface AnalysisResult {
  riasec: RIASECProfile;
  bigFive: BigFiveProfile;
  riasecTop3: string[];
  riasecDescription: string;
  bigFiveDescription: string;
  personalityInsights: string;
  careerSuggestions: string[];
  strengthAreas: string[];
  developmentAreas: string[];
}

// RIASEC boyut açıklamaları (Türkçe - genişletilmiş)
const RIASEC_DESCRIPTIONS: Record<string, { name: string; description: string; careers: string[]; traits: string[] }> = {
  R: {
    name: 'Gerçekçi (Realistic)',
    description: 'Pratik, el becerisi gerektiren, somut sonuçlar üreten işleri tercih edersin. Araç-gereç kullanmayı, doğada çalışmayı ve fiziksel aktiviteleri seversin.',
    careers: ['Mühendislik', 'Mimarlık', 'Pilotluk', 'Veterinerlik', 'Spor Eğitmenliği', 'Teknisyenlik', 'Çiftçilik/Tarım', 'Elektrik Mühendisi', 'Makine Mühendisi', 'İnşaat Mühendisi'],
    traits: ['Pratik', 'Somut düşünen', 'Fiziksel olarak aktif', 'Doğa sever']
  },
  I: {
    name: 'Araştırmacı (Investigative)',
    description: 'Analitik düşünmeyi, araştırmayı ve problem çözmeyi seversin. Bilimsel konulara meraklısın ve derinlemesine analiz yapmaktan keyif alırsın.',
    careers: ['Bilim İnsanı', 'Doktorluk', 'Yazılım Geliştirici', 'Veri Analisti', 'Akademisyen', 'Eczacılık', 'Biyoteknoloji', 'Yapay Zeka Mühendisi', 'Araştırma Görevlisi', 'Psikolog'],
    traits: ['Analitik', 'Meraklı', 'Bağımsız düşünen', 'Bilimsel']
  },
  A: {
    name: 'Sanatsal (Artistic)',
    description: 'Yaratıcılığını kullanmayı, özgün fikirler üretmeyi ve kendini ifade etmeyi seversin. Estetik duyarlılığın yüksek.',
    careers: ['Grafik Tasarımcı', 'Yazar/Editör', 'Müzisyen', 'Film Yönetmeni', 'Mimar', 'Fotoğrafçı', 'İç Mimar', 'UX/UI Tasarımcı', 'Oyun Tasarımcısı', 'Moda Tasarımcısı'],
    traits: ['Yaratıcı', 'Özgün', 'Estetik duyarlı', 'Hayal gücü yüksek']
  },
  S: {
    name: 'Sosyal (Social)',
    description: 'İnsanlarla çalışmayı, yardım etmeyi ve iletişim kurmayı seversin. Empati yeteneğin güçlü ve takım çalışmasında başarılısın.',
    careers: ['Öğretmenlik', 'Psikolojik Danışmanlık', 'Sosyal Hizmet', 'Hemşirelik', 'İnsan Kaynakları', 'Halkla İlişkiler', 'Rehberlik', 'Fizyoterapist', 'Diyetisyen', 'Sosyolog'],
    traits: ['Empatik', 'İletişim güçlü', 'Yardımsever', 'İşbirlikçi']
  },
  E: {
    name: 'Girişimci (Enterprising)',
    description: 'Liderlik etmeyi, ikna etmeyi ve risk almayı seversin. Hedef odaklısın ve insanları yönlendirmekten keyif alırsın.',
    careers: ['Girişimcilik', 'Pazarlama Yöneticisi', 'Avukatlık', 'Satış Müdürü', 'Siyasetçi', 'Proje Yöneticisi', 'CEO/Yönetici', 'Gayrimenkul Danışmanı', 'İş Geliştirme Uzmanı', 'Diplomat'],
    traits: ['Lider', 'İkna edici', 'Risk alan', 'Hedef odaklı']
  },
  C: {
    name: 'Geleneksel (Conventional)',
    description: 'Düzenli, sistematik ve detay odaklı çalışmayı seversin. Kurallar çerçevesinde çalışmaktan ve veri yönetiminden keyif alırsın.',
    careers: ['Muhasebeci', 'Bankacı', 'İstatistikçi', 'Kütüphaneci', 'Lojistik Uzmanı', 'Kalite Kontrol', 'Devlet Memuru', 'Mali Müşavir', 'Vergi Müfettişi', 'Arşivci'],
    traits: ['Düzenli', 'Sistematik', 'Detay odaklı', 'Güvenilir']
  }
};

// Big Five boyut açıklamaları
const BIG_FIVE_DESCRIPTIONS: Record<keyof BigFiveProfile, { name: string; highDesc: string; lowDesc: string }> = {
  openness: {
    name: 'Deneyime Açıklık',
    highDesc: 'Yeni deneyimlere, fikirlere ve yaratıcı çözümlere açıksın. Merak duygun yüksek ve farklı bakış açılarını keşfetmekten keyif alıyorsun.',
    lowDesc: 'Geleneksel ve kanıtlanmış yöntemleri tercih ediyorsun. Pratik ve somut yaklaşımlar sana daha uygun.'
  },
  conscientiousness: {
    name: 'Sorumluluk',
    highDesc: 'Disiplinli, organize ve hedef odaklısın. Görevlerini zamanında ve titizlikle tamamlarsın.',
    lowDesc: 'Esnek ve spontan bir yaklaşımı tercih ediyorsun. Katı planlar yerine akışa bırakmayı seviyorsun.'
  },
  extraversion: {
    name: 'Dışa Dönüklük',
    highDesc: 'Sosyal, enerjik ve insanlarla etkileşimden güç alıyorsun. Grup çalışmalarında ve sosyal ortamlarda rahat hissediyorsun.',
    lowDesc: 'Daha içe dönük ve bağımsız çalışmayı tercih ediyorsun. Küçük gruplar ve bireysel projeler sana daha uygun.'
  },
  agreeableness: {
    name: 'Uyumluluk',
    highDesc: 'İşbirlikçi, güvenilir ve başkalarının ihtiyaçlarına duyarlısın. Uyumlu çalışma ortamları yaratmakta başarılısın.',
    lowDesc: 'Bağımsız düşünmeyi ve kendi fikirlerini savunmayı tercih ediyorsun. Rekabetçi ortamlarda başarılı olabilirsin.'
  },
  emotionalStability: {
    name: 'Duygusal Denge',
    highDesc: 'Stresli durumlarda sakin kalabiliyorsun. Duygusal dayanıklılığın yüksek ve baskı altında iyi performans gösteriyorsun.',
    lowDesc: 'Duygusal olarak hassas ve empatik bir yapın var. Stres yönetimi becerilerini geliştirmek sana fayda sağlayabilir.'
  }
};

/**
 * Cevaplardan RIASEC profili çıkar
 * Genişletilmiş anahtar kelime haritası ile daha doğru skorlama
 */
export function analyzeRIASEC(answers: Array<{ question: string; answer: string }>): RIASECProfile {
  const profile: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // Genişletilmiş anahtar kelime-boyut eşlemeleri
  const keywordMap: Record<string, keyof RIASECProfile> = {
    // Realistic - Gerçekçi (genişletilmiş)
    'spor': 'R', 'beden eğitimi': 'R', 'doğa': 'R', 'hayvan': 'R', 'atölye': 'R',
    'laboratuvar': 'R', 'üretim': 'R', 'saha': 'R', 'dışarıda': 'R', 'fiziksel': 'R',
    'antrenman': 'R', 'el sanatları': 'R', 'tamir': 'R', 'mekanik': 'R',
    'inşaat': 'R', 'tarım': 'R', 'ormancılık': 'R', 'denizcilik': 'R', 'madencilik': 'R',
    'elektrik': 'R', 'motor': 'R', 'makine': 'R', 'alet': 'R', 'montaj': 'R',
    'bahçe': 'R', 'avcılık': 'R', 'balıkçılık': 'R', 'kampçılık': 'R',
    // Investigative - Araştırmacı (genişletilmiş)
    'matematik': 'I', 'fizik': 'I', 'kimya': 'I', 'biyoloji': 'I', 'araştırma': 'I',
    'analiz': 'I', 'bulmaca': 'I', 'bilim': 'I', 'deney': 'I', 'veri': 'I',
    'istatistik': 'I', 'problem çöz': 'I', 'kodlama': 'I', 'bilişim': 'I',
    'algoritma': 'I', 'yapay zeka': 'I', 'teknoloji': 'I', 'programlama': 'I',
    'teori': 'I', 'hipotez': 'I', 'gözlem': 'I', 'keşfet': 'I', 'merak': 'I',
    'astronomi': 'I', 'genetik': 'I', 'nörobilim': 'I', 'fen': 'I',
    // Artistic - Sanatsal (genişletilmiş)
    'resim': 'A', 'müzik': 'A', 'sanat': 'A', 'yaratıcı': 'A', 'tasarım': 'A',
    'fotoğraf': 'A', 'video': 'A', 'içerik üret': 'A', 'hikaye': 'A', 'edebiyat': 'A',
    'sahne': 'A', 'stüdyo': 'A', 'görsel': 'A', 'estetik': 'A',
    'tiyatro': 'A', 'dans': 'A', 'sinema': 'A', 'şiir': 'A', 'roman': 'A',
    'heykel': 'A', 'seramik': 'A', 'grafik': 'A', 'animasyon': 'A', 'moda': 'A',
    'enstrüman': 'A', 'kompozisyon': 'A', 'illüstrasyon': 'A',
    // Social - Sosyal (genişletilmiş)
    'yardım': 'S', 'dinle': 'S', 'öğret': 'S', 'eğitim': 'S', 'hastane': 'S',
    'sağlık': 'S', 'insanlar': 'S', 'arkadaş': 'S', 'topluluk': 'S', 'gönüllü': 'S',
    'empati': 'S', 'arabulucu': 'S', 'uyum': 'S', 'takım': 'S',
    'danışman': 'S', 'rehber': 'S', 'psikoloji': 'S', 'sosyal': 'S', 'iletişim': 'S',
    'bakım': 'S', 'destek': 'S', 'paylaş': 'S', 'birlikte': 'S', 'dayanışma': 'S',
    'çocuk': 'S', 'yaşlı': 'S', 'engelli': 'S', 'toplum': 'S',
    // Enterprising - Girişimci (genişletilmiş)
    'lider': 'E', 'organize': 'E', 'karar': 'E', 'girişim': 'E', 'iş insanı': 'E',
    'yönet': 'E', 'ikna': 'E', 'satış': 'E', 'pazarlama': 'E', 'risk': 'E',
    'rekabet': 'E', 'strateji': 'E', 'hedef': 'E',
    'müzakere': 'E', 'sunum': 'E', 'motivasyon': 'E', 'vizyon': 'E', 'proje': 'E',
    'şirket': 'E', 'ticaret': 'E', 'finans': 'E', 'yatırım': 'E', 'kâr': 'E',
    'başarı': 'E', 'etki': 'E', 'güç': 'E',
    // Conventional - Geleneksel (genişletilmiş)
    'düzen': 'C', 'plan': 'C', 'detay': 'C', 'kural': 'C', 'muhasebe': 'C',
    'ofis': 'C', 'masa başı': 'C', 'bilgisayar': 'C', 'memur': 'C', 'kamu': 'C',
    'sistematik': 'C', 'titiz': 'C', 'takipçi': 'C',
    'dosya': 'C', 'kayıt': 'C', 'arşiv': 'C', 'rapor': 'C', 'tablo': 'C',
    'bütçe': 'C', 'denetim': 'C', 'prosedür': 'C', 'standart': 'C', 'kontrol': 'C',
    'vergi': 'C', 'mevzuat': 'C', 'hukuk': 'C',
  };

  // Hem soru hem cevap metinlerinden anahtar kelime ara
  for (const { question, answer } of answers) {
    const text = `${question} ${answer}`.toLowerCase();
    for (const [keyword, dimension] of Object.entries(keywordMap)) {
      if (text.includes(keyword)) {
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
 * Cevaplardan Big Five profili çıkar
 */
export function analyzeBigFive(answers: Array<{ question: string; answer: string }>): BigFiveProfile {
  const profile: BigFiveProfile = {
    openness: 0, conscientiousness: 0, extraversion: 0,
    agreeableness: 0, emotionalStability: 0
  };

  const keywordMap: Record<string, keyof BigFiveProfile> = {
    // Openness - Deneyime Açıklık
    'keşif': 'openness', 'hayal gücü': 'openness', 'yenilikçi': 'openness', 'farklı': 'openness',
    'macera': 'openness', 'hayal': 'openness', 'felsefe': 'openness', 'soyut': 'openness',
    'kültür': 'openness', 'seyahat': 'openness', 'deneyim': 'openness', 'ilham': 'openness',
    // Conscientiousness - Sorumluluk
    'düzenli': 'conscientiousness', 'planlı': 'conscientiousness', 'disiplin': 'conscientiousness',
    'sorumluluk': 'conscientiousness', 'dakik': 'conscientiousness', 'metodik': 'conscientiousness',
    'programlı': 'conscientiousness', 'zamanında': 'conscientiousness', 'dikkatli': 'conscientiousness',
    'çalışkan': 'conscientiousness', 'azimli': 'conscientiousness', 'kararlı': 'conscientiousness',
    // Extraversion - Dışa Dönüklük
    'atılgan': 'extraversion', 'enerjik': 'extraversion', 'konuşkan': 'extraversion',
    'sohbet': 'extraversion', 'parti': 'extraversion', 'kalabalık': 'extraversion',
    'sahne al': 'extraversion', 'aktif': 'extraversion', 'heyecanlı': 'extraversion',
    'eğlence': 'extraversion', 'dışa dönük': 'extraversion', 'canlı': 'extraversion',
    // Agreeableness - Uyumluluk
    'yardımsever': 'agreeableness', 'empatik': 'agreeableness', 'güven': 'agreeableness',
    'uyumlu': 'agreeableness', 'işbirliği': 'agreeableness', 'nazik': 'agreeableness',
    'anlayışlı': 'agreeableness', 'hoşgörü': 'agreeableness', 'cömert': 'agreeableness',
    'fedakar': 'agreeableness', 'dürüst': 'agreeableness', 'saygı': 'agreeableness',
    // Emotional Stability - Duygusal Denge
    'sakin': 'emotionalStability', 'dengeli': 'emotionalStability', 'güçlü': 'emotionalStability',
    'dayanıklı': 'emotionalStability', 'stresle başa çık': 'emotionalStability', 'stabil': 'emotionalStability',
    'olgun': 'emotionalStability', 'sabırlı': 'emotionalStability', 'rahat': 'emotionalStability',
    'özgüven': 'emotionalStability', 'soğukkanlı': 'emotionalStability',
  };

  for (const { question, answer } of answers) {
    const text = `${question} ${answer}`.toLowerCase();
    for (const [keyword, dimension] of Object.entries(keywordMap)) {
      if (text.includes(keyword)) {
        profile[dimension] += 1;
      }
    }
  }

  // Normalize to 0-100 scale
  const maxScore = Math.max(...Object.values(profile), 1);
  for (const key of Object.keys(profile) as Array<keyof BigFiveProfile>) {
    profile[key] = Math.round((profile[key] / maxScore) * 100);
  }

  return profile;
}

/**
 * RIASEC profilinden en güçlü boyutları çıkar
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
    return `**${dim.name}** (Skor: ${profile[code as keyof RIASECProfile]}/100): ${dim.description}\n- Öne çıkan özellikler: ${dim.traits.join(', ')}`;
  });

  return `## RIASEC Profil Analizi\n\nSenin en güçlü 3 boyutun: **${top3.map(c => RIASEC_DESCRIPTIONS[c].name).join(', ')}**\n\n${descriptions.join('\n\n')}`;
}

/**
 * Big Five profilinden detaylı açıklama oluştur
 */
export function generateBigFiveDescription(profile: BigFiveProfile): string {
  const entries = Object.entries(profile) as [keyof BigFiveProfile, number][];
  const sorted = entries.sort(([, a], [, b]) => b - a);

  const descriptions = sorted.map(([key, score]) => {
    const dim = BIG_FIVE_DESCRIPTIONS[key];
    const desc = score >= 50 ? dim.highDesc : dim.lowDesc;
    return `**${dim.name}** (${score}/100): ${desc}`;
  });

  return `## Big Five Kişilik Profili\n\n${descriptions.join('\n\n')}`;
}

/**
 * RIASEC profilinden kariyer önerileri oluştur
 */
export function getRIASECCareers(profile: RIASECProfile): string[] {
  const top3 = getTopRIASEC(profile);
  const careers: string[] = [];
  
  for (const code of top3) {
    careers.push(...RIASEC_DESCRIPTIONS[code].careers.slice(0, 4));
  }

  return Array.from(new Set(careers));
}

/**
 * Tam analiz sonucu oluştur (RIASEC + Big Five)
 */
export function performFullAnalysis(answers: Array<{ question: string; answer: string }>): AnalysisResult {
  const riasec = analyzeRIASEC(answers);
  const bigFive = analyzeBigFive(answers);
  const top3 = getTopRIASEC(riasec);
  const riasecDescription = generateRIASECDescription(riasec);
  const bigFiveDescription = generateBigFiveDescription(bigFive);
  const careers = getRIASECCareers(riasec);

  // Güçlü alanları belirle
  const strengthAreas = top3.map(code => RIASEC_DESCRIPTIONS[code].name);

  // Gelişim alanlarını belirle (en düşük 2 boyut)
  const bottom2 = Object.entries(riasec)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([key]) => RIASEC_DESCRIPTIONS[key].name);

  // Big Five'dan kişilik içgörüsü oluştur
  const bigFiveTop = Object.entries(bigFive)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => BIG_FIVE_DESCRIPTIONS[key as keyof BigFiveProfile].name);

  return {
    riasec,
    bigFive,
    riasecTop3: top3,
    riasecDescription,
    bigFiveDescription,
    personalityInsights: `RIASEC profilin ${strengthAreas.join(' ve ')} boyutlarında güçlü. Big Five analizine göre ${bigFiveTop.join(' ve ')} özelliklerinde öne çıkıyorsun. Bu kombinasyon, ${careers.slice(0, 4).join(', ')} gibi alanlarda başarılı olabileceğini gösteriyor.`,
    careerSuggestions: careers,
    strengthAreas,
    developmentAreas: bottom2,
  };
}
