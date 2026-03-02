/**
 * Etap 2 - Yaş Grubuna Özel Soru Güncelleme Script'i
 * 
 * 14-17 yaş: Yetenek Keşfi ve Mesleki Eğilim Analizi
 *   → Lise öğrencisine özgü: okul dersleri, hobiler, değerler, kariyer hayal gücü
 * 
 * 18-21 yaş: Profesyonel Yetenek ve Eğilim Analizi
 *   → Üniversite öğrencisine özgü: sektör tercihleri, teknik beceriler, kariyer faktörleri
 * 
 * 22-24 yaş: Profesyonel Gelişim ve Liderlik Analizi
 *   → Genç profesyonel: liderlik, sektör trendleri, uzun vadeli vizyon
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ============================================================
// ETAP 2 - 14-17 YAŞ (stageId: 60002)
// Yetenek Keşfi ve Mesleki Eğilim Analizi
// ============================================================
const stage2_1417 = [
  {
    order: 1,
    text: "Bir arkadaşın sana bir konuda yardım istese, hangi alanda en çok yardımcı olabilirsin?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Matematik / fen bilimleri / problem çözme",
      "Yazı yazmak / ödev / sunum hazırlamak",
      "Duygusal destek / dinlemek / tavsiye vermek",
      "Spor / fiziksel aktivite",
      "Sanat / müzik / yaratıcı projeler",
      "Teknoloji / bilgisayar / oyun",
      "Organizasyon / plan yapma"
    ]),
    required: true
  },
  {
    order: 2,
    text: "Hangi tür filmler veya diziler izlemekten keyif alırsın?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Bilim kurgu / teknoloji / uzay",
      "Tıp / hastane / sağlık",
      "Hukuk / polisiye / suç",
      "Tarih / belgesel / biyografi",
      "Spor / aksiyon / macera",
      "Sanat / müzik / dans",
      "Komedi / romantik",
      "Doğa / çevre / hayvanlar"
    ]),
    required: true
  },
  {
    order: 3,
    text: "Aşağıdaki senaryolardan hangisi seni en çok heyecanlandırır?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Bir hastalığı tedavi eden yeni bir ilaç keşfetmek",
      "Milyonlarca insanın kullandığı bir uygulama geliştirmek",
      "Bir davayı kazanarak adaleti sağlamak",
      "Öğrencilerinin hayatını değiştiren bir öğretmen olmak",
      "Olimpiyatlarda ülkeni temsil etmek",
      "Dünyaca ünlü bir sanatçı / müzisyen olmak",
      "Kendi şirketini kurarak iş insanı olmak",
      "İnsanların psikolojik sorunlarını çözmelerine yardımcı olmak"
    ]),
    required: true
  },
  {
    order: 4,
    text: "Okul projeleri veya ödevlerde hangi tür çalışmalar seni daha çok zorluyor?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Ezber gerektiren konular",
      "Matematik / formül / hesaplama",
      "Uzun yazı / kompozisyon yazmak",
      "Sunum / sınıf önünde konuşmak",
      "Grup çalışması / takım koordinasyonu",
      "Yaratıcı / açık uçlu projeler",
      "Hiçbiri, her türlü çalışmayı seviyorum"
    ]),
    required: true
  },
  {
    order: 5,
    text: "Gelecekte çalışmak istediğin insanlar kimler?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Hastalar / hasta yakınları (sağlık sektörü)",
      "Öğrenciler / çocuklar (eğitim)",
      "Müşteriler / iş ortakları (ticaret)",
      "Mühendisler / bilim insanları (teknik)",
      "Sanatçılar / yaratıcılar (sanat/medya)",
      "Sporcular / antrenörler (spor)",
      "Avukatlar / yargıçlar / politikacılar (hukuk/siyaset)",
      "Yalnız çalışmayı tercih ederim"
    ]),
    required: true
  },
  {
    order: 6,
    text: "Seni en çok motive eden başarı türü hangisidir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Sınavda yüksek not almak",
      "Bir spor müsabakasını kazanmak",
      "Bir sanat eserini tamamlamak",
      "Zor bir problemi çözmek",
      "Birinin sorununu çözüp teşekkür almak",
      "Bir projeyi ekiple başarıyla bitirmek",
      "Yeni bir beceri öğrenmek"
    ]),
    required: true
  },
  {
    order: 7,
    text: "Türkiye'de hangi mesleklerin gelecekte daha çok ihtiyaç duyulacağını düşünüyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Yazılım mühendisleri / yapay zeka uzmanları",
      "Sağlık profesyonelleri (doktor, hemşire, psikolog)",
      "Çevre / enerji mühendisleri",
      "İçerik üreticileri / dijital pazarlamacılar",
      "Öğretmenler / eğitimciler",
      "Girişimciler / iş insanları",
      "Hukuk ve finans uzmanları"
    ]),
    required: true
  },
  {
    order: 8,
    text: "Bir gün ünlü olsaydın, hangi alanda tanınmak isterdin?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Bilim insanı / mucit",
      "Sporcu / şampiyon",
      "Sanatçı / müzisyen / oyuncu",
      "İş insanı / girişimci",
      "Politikacı / lider",
      "Yazar / gazeteci",
      "Doktor / insanlığa hizmet eden biri",
      "Ünlü olmak istemiyorum"
    ]),
    required: false
  },
  {
    order: 9,
    text: "Yapay zekanın (AI) geleceğini nasıl değerlendiriyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Heyecan verici! Teknolojiye ilgi duyuyorum ve bu alanda çalışmak istiyorum",
      "Faydalı ama bazı meslekleri tehdit ediyor, dikkatli olmalıyız",
      "Korkutucu, insanların işini elimden alacak",
      "Pek ilgilenmiyorum, benim alanımı etkilemez",
      "Henüz yeterince bilgim yok bu konuda"
    ]),
    required: true
  },
  {
    order: 10,
    text: "Hangi ders konuları seni gerçekten meraklandırıyor, daha fazla öğrenmek istiyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "İnsan vücudu ve sağlık (biyoloji, anatomi)",
      "Uzay ve evren (astronomi, fizik)",
      "Tarih ve medeniyetler",
      "Psikoloji ve insan davranışı",
      "Matematik ve mantık",
      "Dil ve edebiyat",
      "Ekonomi ve iş dünyası",
      "Çevre ve doğa bilimleri"
    ]),
    required: true
  },
  {
    order: 11,
    text: "Kariyer seçiminde seni en çok endişelendiren şey nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Yanlış mesleği seçmek ve pişman olmak",
      "Ailem istediğim mesleği onaylamayacak",
      "Üniversite sınavında istediğim bölümü kazanamamak",
      "Seçtiğim meslekte iş bulamayacağım",
      "Maddi olarak yeterince kazanamayacağım",
      "Yeteneklerim yeterli olmayacak",
      "Şu an çok endişeli değilim"
    ]),
    required: true
  },
  {
    order: 12,
    text: "Eğer para ve sınav sonucu önemli olmasaydı, hangi mesleği seçerdin? Neden?",
    type: "text",
    options: null,
    required: true
  }
];

// ============================================================
// ETAP 2 - 18-21 YAŞ (stageId: 60005)
// Profesyonel Yetenek ve Eğilim Analizi
// ============================================================
const stage2_1821 = [
  {
    order: 1,
    text: "Hangi sektörde kariyer yapmak istiyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Teknoloji / Yazılım / Yapay Zeka",
      "Finans / Bankacılık / Yatırım",
      "Sağlık / Biyoteknoloji / Eczacılık",
      "Eğitim / Akademi / Araştırma",
      "Medya / İletişim / Reklamcılık",
      "Danışmanlık / Yönetim",
      "Kamu / Sivil Toplum",
      "Girişimcilik / Startup",
      "Mühendislik / Üretim / Enerji",
      "Hukuk / Adalet"
    ]),
    required: true
  },
  {
    order: 2,
    text: "Liderlik rolü üstlenmek sana nasıl hissettiriyor?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç istemiyorum, sorumluluk almaktan kaçınırım",
      "2",
      "3 - Duruma göre, bazen evet bazen hayır",
      "4",
      "5 - Çok istiyorum, liderlik beni motive ediyor"
    ]),
    required: true
  },
  {
    order: 3,
    text: "Hangi teknik becerilere sahipsin veya geliştirmek istiyorsun? (En fazla 4 seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Programlama (Python, Java, JavaScript vb.)",
      "Veri analizi / istatistik / Excel",
      "Grafik tasarım / UI/UX",
      "Dijital pazarlama / SEO / sosyal medya",
      "Proje yönetimi (Agile, Scrum)",
      "Finansal modelleme / muhasebe",
      "Araştırma metodolojisi / akademik yazarlık",
      "Yabancı dil (C1+ seviyesi)",
      "Video prodüksiyon / içerik üretimi",
      "Henüz belirli bir teknik beceri geliştirmedim"
    ]),
    required: true
  },
  {
    order: 4,
    text: "Belirsizlik ve değişimle başa çıkma konusunda kendini nasıl değerlendiriyorsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Çok zorlanıyorum, belirsizlik beni strese sokuyor",
      "2",
      "3 - Orta düzeyde başa çıkabiliyorum",
      "4",
      "5 - Çok iyi başa çıkıyorum, değişim beni heyecanlandırıyor"
    ]),
    required: true
  },
  {
    order: 5,
    text: "Kariyer gelişimin için hangi adımları atmayı planlıyorsun? (Birden fazla seçebilirsin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Sektörel sertifika / kurs tamamlamak",
      "Staj / iş deneyimi edinmek",
      "Kişisel proje / portföy oluşturmak",
      "Profesyonel ağ (network) kurmak",
      "Yurt dışı deneyimi / değişim programı",
      "Yüksek lisans / MBA planlamak",
      "Girişim kurmak / startup fikri geliştirmek",
      "Henüz somut bir plan yapmadım"
    ]),
    required: true
  },
  {
    order: 6,
    text: "Kariyer seçiminde aşağıdaki faktörleri önem sırasına göre değerlendir",
    type: "ranking",
    options: JSON.stringify([
      "Yüksek maaş ve maddi güvence",
      "İş-yaşam dengesi",
      "Toplumsal etki ve anlam",
      "Kariyer gelişim fırsatları",
      "Çalışma ortamı ve şirket kültürü",
      "Uluslararası fırsatlar"
    ]),
    required: true
  },
  {
    order: 7,
    text: "Üniversite hayatında karşılaştığın en zorlu deneyimi ve bu deneyimden ne öğrendiğini anlat.",
    type: "text",
    options: null,
    required: true
  },
  {
    order: 8,
    text: "Girişimcilik hakkındaki görüşün nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Kesinlikle girişimci olmak istiyorum, kendi şirketimi kuracağım",
      "Önce deneyim kazanacağım, sonra girişimcilik düşünebilirim",
      "Belki, ama önce güvenli bir iş istiyorum",
      "Girişimcilik benim için değil, kurumsal kariyer tercih ederim",
      "Sosyal girişimcilik / sivil toplum alanında çalışmak istiyorum"
    ]),
    required: true
  },
  {
    order: 9,
    text: "Ağ oluşturma (networking) ve profesyonel ilişkiler kurma konusunda ne kadar aktifsin?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç aktif değilim, bu konuda çok çekingenim",
      "2",
      "3 - Orta düzeyde, bazen katılıyorum",
      "4",
      "5 - Çok aktifim, düzenli etkinliklere katılıyorum"
    ]),
    required: true
  },
  {
    order: 10,
    text: "Yapay zeka ve otomasyon trendleri kariyer planlamanı nasıl etkiliyor?",
    type: "multiple_choice",
    options: JSON.stringify([
      "AI'ya dayanıklı alanlara yöneliyorum (insan ilişkileri, yaratıcılık, strateji)",
      "AI araçlarını öğrenmeye odaklanıyorum, teknolojiyle birlikte çalışacağım",
      "AI benim sektörümü çok etkilemez diye düşünüyorum",
      "Bu konuyu henüz yeterince düşünmedim",
      "AI beni endişelendiriyor ama ne yapacağımı bilmiyorum"
    ]),
    required: true
  },
  {
    order: 11,
    text: "Hayran olduğun bir kariyer figürü veya mentor var mı? Bu kişiden ne öğrenmek istersin?",
    type: "text",
    options: null,
    required: false
  },
  {
    order: 12,
    text: "Yüksek lisans veya doktora yapmayı düşünüyor musun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Evet, Türkiye'de yüksek lisans yapmak istiyorum",
      "Evet, yurt dışında yüksek lisans yapmak istiyorum",
      "Belki, henüz karar vermedim",
      "Hayır, iş hayatına odaklanmak istiyorum",
      "Hayır, girişimcilik / kendi işim daha cazip"
    ]),
    required: true
  }
];

// ============================================================
// ETAP 2 - 22-24 YAŞ (stageId: 60008)
// Profesyonel Gelişim ve Liderlik Analizi
// ============================================================
const stage2_2224 = [
  {
    order: 1,
    text: "Liderlik tarzını en iyi hangisi tanımlıyor?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Vizyoner: Büyük resmi görür, ilham veririm",
      "Koçluk yapan: Ekibi geliştirmeye odaklanırım",
      "Demokratik: Katılımcı karar alma süreçleri yönetirim",
      "Sonuç odaklı: Hedeflere ulaşmak için baskı yaparım",
      "Hizmet eden lider: Ekibimin ihtiyaçlarını önce karşılarım",
      "Henüz liderlik deneyimim yok, tarzımı bilmiyorum"
    ]),
    required: true
  },
  {
    order: 2,
    text: "Karmaşık iş problemlerini çözme konusunda kendini nasıl değerlendiriyorsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Çok zorlanıyorum, yapılandırılmış destek ihtiyacım var",
      "2",
      "3 - Orta düzeyde başa çıkabiliyorum",
      "4",
      "5 - Çok iyiyim, karmaşık problemler beni heyecanlandırıyor"
    ]),
    required: true
  },
  {
    order: 3,
    text: "Hangi sektörel trendlerin kariyerini en çok etkileyeceğini düşünüyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Yapay zeka ve otomasyon",
      "Sürdürülebilirlik ve yeşil ekonomi",
      "Uzaktan çalışma ve dijital dönüşüm",
      "Küreselleşme ve uluslararası rekabet",
      "Demografik değişimler (yaşlanan nüfus, Z kuşağı)",
      "Fintech ve kripto ekonomisi",
      "Sağlık teknolojileri ve biyoteknoloji"
    ]),
    required: true
  },
  {
    order: 4,
    text: "Şimdiye kadar yönettiğin veya liderlik ettiğin bir proje veya ekip deneyimini anlat. Sonuçlar nasıl oldu?",
    type: "text",
    options: null,
    required: true
  },
  {
    order: 5,
    text: "Çatışma yönetimi ve zor konuşmalar yapma konusunda kendini ne kadar hazır hissediyorsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Çatışmadan kaçınırım, çok zorlanıyorum",
      "2",
      "3 - Duruma göre başa çıkabiliyorum",
      "4",
      "5 - Çok iyiyim, zor konuşmalardan kaçınmam"
    ]),
    required: true
  },
  {
    order: 6,
    text: "Hangi alanlarda kendinizi geliştirmek için aktif adım atıyorsunuz? (Birden fazla seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Teknik sertifikasyon (AWS, PMP, CFA, CPA vb.)",
      "Yönetim ve liderlik eğitimi",
      "Yabancı dil geliştirme",
      "Sektörel konferans ve etkinlikler",
      "Mentorluk alma / verme",
      "MBA veya yüksek lisans",
      "Kişisel marka (LinkedIn, blog, konuşmacılık)",
      "Henüz aktif bir gelişim planım yok"
    ]),
    required: true
  },
  {
    order: 7,
    text: "Uzun vadeli kariyer başarısı için aşağıdaki faktörleri önem sırasına göre değerlendir",
    type: "ranking",
    options: JSON.stringify([
      "Teknik uzmanlık ve sektör bilgisi",
      "Liderlik ve yönetim becerileri",
      "Güçlü profesyonel ağ (network)",
      "Duygusal zeka ve insan ilişkileri",
      "Finansal okuryazarlık ve iş zekası",
      "Uluslararası deneyim ve perspektif"
    ]),
    required: true
  },
  {
    order: 8,
    text: "Sektörünüzdeki gelişmeleri takip etme ve güncel kalma konusunda ne kadar aktifsiniz?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç takip etmiyorum, zamanım yok",
      "2",
      "3 - Zaman zaman takip ediyorum",
      "4",
      "5 - Çok aktifim, sektörümde düzenli kaynak takip ediyorum"
    ]),
    required: true
  },
  {
    order: 9,
    text: "Kariyer gelişiminde en çok hangi kaynaktan faydalanıyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Mentorluk ve koçluk",
      "Profesyonel eğitim ve kurslar",
      "Kitap ve akademik kaynaklar",
      "Podcast ve video içerikler",
      "Sektör etkinlikleri ve konferanslar",
      "Meslektaş ve çevre tavsiyesi",
      "Deneme yanılma / pratik deneyim"
    ]),
    required: true
  },
  {
    order: 10,
    text: "3 yıl sonra hangi pozisyonda olmak istiyorsun? Bu hedefe ulaşmak için eksik olduğun en kritik 2 beceri nedir?",
    type: "text",
    options: null,
    required: true
  },
  {
    order: 11,
    text: "Girişimcilik veya intrapreneurship (kurum içi girişimcilik) konusundaki tutumun nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Aktif olarak girişim planlıyorum veya kurdum",
      "Kısa vadede değil ama uzun vadede düşünüyorum",
      "Kurum içi girişimcilik (intrapreneurship) daha cazip",
      "Kariyer güvencesi ve istikrar benim için daha önemli",
      "Sosyal girişimcilik / etki yatırımı alanında çalışmak istiyorum"
    ]),
    required: true
  },
  {
    order: 12,
    text: "Uluslararası kariyer fırsatlarına ne kadar açıksın?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç açık değilim, Türkiye'de kalmak istiyorum",
      "2",
      "3 - Doğru fırsat olursa değerlendiririm",
      "4",
      "5 - Çok açığım, aktif olarak yurt dışı fırsatları arıyorum"
    ]),
    required: true
  }
];

// ============================================================
// VERİTABANINA UYGULA
// ============================================================

async function updateStageQuestions(stageId, questions, stageName) {
  console.log(`\n🔄 ${stageName} (ID: ${stageId}) güncelleniyor...`);
  
  // Mevcut soruları sil
  const [deleteResult] = await conn.execute('DELETE FROM questions WHERE stageId = ?', [stageId]);
  console.log(`   ✅ ${deleteResult.affectedRows} eski soru silindi`);
  
  // Yeni soruları ekle
  for (const q of questions) {
    await conn.execute(
      'INSERT INTO questions (stageId, text, type, options, required, `order`) VALUES (?, ?, ?, ?, ?, ?)',
      [stageId, q.text, q.type, q.options, q.required ? 1 : 0, q.order]
    );
  }
  console.log(`   ✅ ${questions.length} yeni soru eklendi`);
}

await updateStageQuestions(60002, stage2_1417, 'Etap 2 - 14-17 yaş');
await updateStageQuestions(60005, stage2_1821, 'Etap 2 - 18-21 yaş');
await updateStageQuestions(60008, stage2_2224, 'Etap 2 - 22-24 yaş');

await conn.end();
console.log('\n✅ Etap 2 soruları başarıyla güncellendi!');
console.log('Toplam: 3 etap × 12 soru = 36 soru');
