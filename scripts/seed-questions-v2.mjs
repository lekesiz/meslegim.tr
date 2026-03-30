/**
 * Meslegim.tr - Yaş Grubuna Özel Zenginleştirilmiş Kariyer Değerlendirme Soruları v2
 * 
 * Her yaş grubuna özel, daha derinlemesine ve hedefli sorular:
 * - 14-17 yaş: Lise odaklı - keşif, yetenek tespiti, gelecek planlaması
 * - 18-21 yaş: Üniversite odaklı - kariyer hazırlığı, staj, profesyonel gelişim
 * - 22-24 yaş: Kariyer odaklı - iş deneyimi, liderlik, stratejik planlama
 * 
 * Her etapta 15 soru (önceki 12'den artırıldı)
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Mevcut Etap 1-3 sorularını sil (yenileriyle değiştireceğiz)
const stageIds = [60001, 60002, 60003, 60004, 60005, 60006, 60007, 60008, 60009];
await conn.query(`DELETE FROM questions WHERE stageId IN (${stageIds.join(',')})`);
console.log('Mevcut Etap 1-3 soruları silindi.');

// ============================================================
// YAŞ GRUBU: 14-17 (LİSE ODAKLI)
// Tema: Keşif, merak, potansiyel tespiti
// Dil: Samimi, anlaşılır, motive edici
// ============================================================

// ETAP 1 (60001): Kendini Tanı - İlgi ve Yetenek Keşfi
const etap1_14_17 = [
  {
    stageId: 60001, order: 1, type: 'multiple_choice', required: true,
    text: 'Okulda en çok hangi dersleri seviyorsun? (En fazla 3 seçin)',
    options: JSON.stringify(['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih / Coğrafya', 'Türkçe / Edebiyat', 'İngilizce / Yabancı Dil', 'Bilişim / Teknoloji', 'Beden Eğitimi / Spor', 'Müzik / Görsel Sanatlar', 'Felsefe / Psikoloji']),
    metadata: JSON.stringify({ allowMultiple: true, maxSelect: 3, category: 'interest_discovery' })
  },
  {
    stageId: 60001, order: 2, type: 'multiple_choice', required: true,
    text: 'Boş zamanlarında en çok ne yapmaktan keyif alırsın? (En fazla 3 seçin)',
    options: JSON.stringify(['Resim çizmek / el sanatları yapmak', 'Müzik aleti çalmak veya şarkı söylemek', 'Spor yapmak / antrenman', 'Bilgisayar / kodlama / oyun geliştirme', 'Kitap okumak / hikaye yazmak', 'Arkadaşlarıma yardım etmek / sorunlarını dinlemek', 'Doğada vakit geçirmek / hayvanlarla ilgilenmek', 'Matematik / bulmaca çözmek', 'Video / fotoğraf çekmek / içerik üretmek', 'Sosyal medya / topluluk yönetimi', 'Bilimsel deneyler yapmak / araştırmak']),
    metadata: JSON.stringify({ allowMultiple: true, maxSelect: 3, category: 'hobby_analysis' })
  },
  {
    stageId: 60001, order: 3, type: 'multiple_choice', required: true,
    text: 'Sınıfta ya da grup çalışmalarında genellikle hangi rolü üstlenirsin?',
    options: JSON.stringify(['Lider: Grubu organize eder, kararları ben alırım', 'Fikir üretici: Yaratıcı çözümler öneririm', 'Araştırmacı: Bilgi toplar, analiz yaparım', 'Uygulayıcı: Planlananı titizlikle hayata geçiririm', 'Arabulucu: Grup içi uyumu sağlarım', 'Sunucu: Sonuçları en iyi ben anlatırım']),
    metadata: JSON.stringify({ category: 'personality_trait' })
  },
  {
    stageId: 60001, order: 4, type: 'likert', required: true,
    text: 'Kendinizi ne kadar yaratıcı birisi olarak görüyorsunuz?',
    options: JSON.stringify(['1 - Hiç yaratıcı değilim', '2 - Biraz yaratıcıyım', '3 - Orta düzeyde yaratıcıyım', '4 - Oldukça yaratıcıyım', '5 - Çok yaratıcıyım, sürekli yeni fikirler üretirim']),
    metadata: JSON.stringify({ category: 'self_assessment' })
  },
  {
    stageId: 60001, order: 5, type: 'multiple_choice', required: true,
    text: 'Gelecekte çalışmak istediğin ortam hangisine daha yakın?',
    options: JSON.stringify(['Ofis ortamı (masa başı, bilgisayar)', 'Saha / dışarıda aktif çalışma', 'Hastane / klinik / sağlık ortamı', 'Okul / eğitim ortamı', 'Atölye / laboratuvar / üretim alanı', 'Sahne / stüdyo / yaratıcı ortam', 'Uzaktan / evden çalışma', 'Henüz bilmiyorum']),
    metadata: JSON.stringify({ category: 'work_environment' })
  },
  {
    stageId: 60001, order: 6, type: 'multiple_choice', required: true,
    text: 'Ailen senden hangi mesleği yapmanı bekliyor?',
    options: JSON.stringify(['Doktor / Mühendis / Avukat (klasik prestijli meslekler)', 'Öğretmen / Akademisyen', 'İş insanı / Girişimci', 'Sanatçı / Sporcu / Yaratıcı alan', 'Devlet memuru / Kamu görevlisi', 'Ailemin beklentisi yok, kendi kararımı veriyorum', 'Aile baskısı var ama farklı bir şey istiyorum']),
    metadata: JSON.stringify({ category: 'family_influence' })
  },
  {
    stageId: 60001, order: 7, type: 'likert', required: true,
    text: 'Üniversite sınavına (YKS) ne kadar hazırlıklı hissediyorsun?',
    options: JSON.stringify(['1 - Hiç hazır değilim, nereden başlayacağımı bilmiyorum', '2 - Biraz çalışıyorum ama yetersiz', '3 - Orta düzeyde, bazı eksiklerim var', '4 - İyi hazırlanıyorum', '5 - Çok hazırım, düzenli çalışıyorum']),
    metadata: JSON.stringify({ category: 'academic_readiness' })
  },
  {
    stageId: 60001, order: 8, type: 'multiple_choice', required: true,
    text: 'Hangi üniversite bölümlerini düşünüyorsun? (Birden fazla seçebilirsin)',
    options: JSON.stringify(['Tıp / Diş Hekimliği / Eczacılık', 'Mühendislik (Bilgisayar, Makine, Elektrik vb.)', 'Hukuk', 'İşletme / Ekonomi / Finans', 'Öğretmenlik / Eğitim Bilimleri', 'Psikoloji / Sosyoloji / Sosyal Bilimler', 'Güzel Sanatlar / Tasarım / Mimarlık', 'İletişim / Medya / Gazetecilik', 'Spor Bilimleri', 'Sağlık Bilimleri (Hemşirelik, Fizyoterapi vb.)', 'Henüz karar vermedim']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'university_preference' })
  },
  {
    stageId: 60001, order: 9, type: 'multiple_choice', required: true,
    text: 'Bir meslek seçerken sana en önemli gelen faktör nedir?',
    options: JSON.stringify(['Yüksek maaş ve maddi güvence', 'Topluma faydalı olmak', 'Yaratıcılık ve özgürlük', 'Prestij ve toplumsal saygınlık', 'İş güvencesi ve stabilite', 'Sürekli yeni şeyler öğrenmek', 'Esnek çalışma saatleri', 'İnsanlarla iletişim halinde olmak']),
    metadata: JSON.stringify({ category: 'career_values' })
  },
  {
    stageId: 60001, order: 10, type: 'multiple_choice', required: true,
    text: 'Zorlu bir matematik problemi veya bulmacayla karşılaştığında ne yaparsın?',
    options: JSON.stringify(['Hemen vazgeçerim, canımı sıkar', 'Biraz denerim, olmazsa bırakırım', 'Sabırla çözmeye çalışırım', 'Çözmeden bırakmam, çok zorlanırsam yardım isterim', 'Heyecanlanırım, zor problemleri severim']),
    metadata: JSON.stringify({ category: 'problem_solving' })
  },
  {
    stageId: 60001, order: 11, type: 'multiple_choice', required: true,
    text: 'Okul dışında herhangi bir kursa, kulübe veya etkinliğe katılıyor musun?',
    options: JSON.stringify(['Evet, spor kulübü / takım', 'Evet, müzik / sanat kursu', 'Evet, dil kursu', 'Evet, kodlama / robotik / bilim kulübü', 'Evet, gönüllü çalışma / sosyal sorumluluk', 'Evet, dershane / özel ders', 'Hayır, katılmıyorum ama katılmak istiyorum', 'Hayır, zamanım yok']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'extracurricular' })
  },
  {
    stageId: 60001, order: 12, type: 'likert', required: true,
    text: 'Yabancılarla veya yeni insanlarla iletişim kurmak sana nasıl geliyor?',
    options: JSON.stringify(['1 - Çok zorlanıyorum, utangacım', '2 - Biraz çekingen davranıyorum', '3 - Duruma göre değişiyor', '4 - Genellikle rahat hissediyorum', '5 - Çok kolay geliyor, sosyal biriyim']),
    metadata: JSON.stringify({ category: 'social_skills' })
  },
  {
    stageId: 60001, order: 13, type: 'multiple_choice', required: true,
    text: 'Hayatta seni en çok motive eden şey nedir?',
    options: JSON.stringify(['Ailemi gururlandırmak', 'Maddi bağımsızlık kazanmak', 'Topluma faydalı olmak', 'Hayallerimi gerçekleştirmek', 'Yeni şeyler öğrenmek ve keşfetmek', 'Tanınmak ve başarılı olmak', 'Özgür ve bağımsız yaşamak']),
    metadata: JSON.stringify({ category: 'motivation' })
  },
  {
    stageId: 60001, order: 14, type: 'multiple_choice', required: true,
    text: 'Aşağıdaki Holland Mesleki İlgi Tiplerinden hangisi seni en iyi tanımlıyor?',
    options: JSON.stringify(['Gerçekçi (Pratik işler, makine, doğa ile çalışmak)', 'Araştırmacı (Bilim, analiz, merak, keşif)', 'Sanatsal (Yaratıcılık, ifade, özgünlük, tasarım)', 'Sosyal (İnsanlara yardım, öğretme, bakım)', 'Girişimci (İş kurma, liderlik, risk alma, ikna)', 'Geleneksel (Düzen, organizasyon, detay odaklı çalışma)']),
    metadata: JSON.stringify({ category: 'holland_type' })
  },
  {
    stageId: 60001, order: 15, type: 'text', required: true,
    text: 'Eğer bir gün kendi işini kursaydın, ne tür bir iş kurardın? Neden? Kısaca açıkla.',
    options: null,
    metadata: JSON.stringify({ category: 'entrepreneurial_vision' })
  }
];

// ETAP 2 (60002): Yetenek Keşfi ve Mesleki Eğilim Analizi (14-17)
const etap2_14_17 = [
  {
    stageId: 60002, order: 1, type: 'multiple_choice', required: true,
    text: 'Bir arkadaşın sana bir konuda yardım istese, hangi alanda en çok yardımcı olabilirsin?',
    options: JSON.stringify(['Ders çalışma / ödev yapma', 'Bilgisayar / telefon sorunu çözme', 'Kişisel sorunlarını dinleme / tavsiye verme', 'Spor / fiziksel aktivite', 'Sanat / müzik / yaratıcı projeler', 'Organizasyon / planlama', 'Bir şeyleri tamir etme / birleştirme']),
    metadata: JSON.stringify({ category: 'skill_awareness' })
  },
  {
    stageId: 60002, order: 2, type: 'multiple_choice', required: true,
    text: 'Hangi tür filmler veya diziler izlemekten keyif alırsın?',
    options: JSON.stringify(['Bilim kurgu / teknoloji', 'Belgesel / tarih', 'Komedi / eğlence', 'Dram / psikolojik', 'Aksiyon / macera', 'Suç / dedektif / gizem', 'Romantik', 'Animasyon / fantastik']),
    metadata: JSON.stringify({ category: 'interest_indicator' })
  },
  {
    stageId: 60002, order: 3, type: 'likert', required: true,
    text: 'Zaman baskısı altında ne kadar iyi çalışabilirsin?',
    options: JSON.stringify(['1 - Hiç iyi çalışamam, paniklerim', '2 - Zorlanırım ama bir şekilde yaparım', '3 - Duruma göre değişiyor', '4 - Genellikle iyi başa çıkarım', '5 - Baskı altında daha iyi çalışırım']),
    metadata: JSON.stringify({ category: 'stress_management' })
  },
  {
    stageId: 60002, order: 4, type: 'multiple_choice', required: true,
    text: 'Hangi tür görevleri yaparken "zaman nasıl geçti?" diye düşünürsün? (Akış hali)',
    options: JSON.stringify(['Bir şeyler tasarlarken veya çizerken', 'Müzik çalarken veya dinlerken', 'Kod yazarken veya bilgisayarla uğraşırken', 'Spor yaparken veya dans ederken', 'Birisiyle derin sohbet ederken', 'Bir problemi çözerken', 'Bir şeyler inşa ederken veya tamir ederken', 'Okurken veya yazarken']),
    metadata: JSON.stringify({ category: 'flow_state' })
  },
  {
    stageId: 60002, order: 5, type: 'likert', required: true,
    text: 'Kendinizi ne kadar iyi bir lider olarak görüyorsunuz?',
    options: JSON.stringify(['1 - Hiç liderlik özelliğim yok', '2 - Çok az', '3 - Orta düzeyde', '4 - İyi bir liderim', '5 - Güçlü bir liderim']),
    metadata: JSON.stringify({ category: 'leadership' })
  },
  {
    stageId: 60002, order: 6, type: 'ranking', required: true,
    text: 'Aşağıdaki değerleri kariyer seçimindeki önem sırasına göre sırala (1=En önemli, 5=En az önemli)',
    options: JSON.stringify(['Yüksek maaş ve maddi güvence', 'Topluma fayda sağlamak', 'Yaratıcılık ve özgürlük', 'Prestij ve statü', 'İş-yaşam dengesi']),
    metadata: JSON.stringify({ category: 'value_ranking' })
  },
  {
    stageId: 60002, order: 7, type: 'multiple_choice', required: true,
    text: 'Aşağıdaki mesleklerden hangisi seni en çok heyecanlandırıyor?',
    options: JSON.stringify(['Yazılım geliştirici / Yapay zeka uzmanı', 'Doktor / Psikolog / Hemşire', 'Mimar / İç mimar / Tasarımcı', 'Öğretmen / Akademisyen', 'Avukat / Hakim / Savcı', 'Girişimci / İş insanı', 'Sanatçı / Müzisyen / Yazar', 'Mühendis (inşaat, makine, elektrik)', 'Pilot / Denizci / Astronot', 'Veteriner / Biyolog / Çevre bilimci']),
    metadata: JSON.stringify({ category: 'career_interest' })
  },
  {
    stageId: 60002, order: 8, type: 'likert', required: true,
    text: 'Yeni bir beceri öğrenmek için ne kadar zaman ve çaba harcamaya hazırsın?',
    options: JSON.stringify(['1 - Çok az, hızlı sonuç isterim', '2 - Biraz çaba harcayabilirim', '3 - Makul süre ayırabilirim', '4 - Uzun süre çalışmaya hazırım', '5 - Yıllarca çalışmaya hazırım, tutkuluyum']),
    metadata: JSON.stringify({ category: 'perseverance' })
  },
  {
    stageId: 60002, order: 9, type: 'multiple_choice', required: true,
    text: 'Bir konuyu öğrenirken en iyi nasıl öğrenirsin?',
    options: JSON.stringify(['Görerek (video, diyagram, görsel materyal)', 'Duyarak (ders anlatımı, podcast, tartışma)', 'Yaparak (uygulama, deney, pratik)', 'Okuyarak (kitap, makale, not tutarak)', 'Başkalarına anlatarak']),
    metadata: JSON.stringify({ category: 'learning_style' })
  },
  {
    stageId: 60002, order: 10, type: 'multiple_choice', required: true,
    text: 'Gelecekte Türkiye\'de mi yoksa yurt dışında mı çalışmayı düşünüyorsun?',
    options: JSON.stringify(['Kesinlikle Türkiye\'de', 'Büyük ihtimalle Türkiye\'de', 'Henüz karar vermedim', 'Büyük ihtimalle yurt dışında', 'Kesinlikle yurt dışında', 'Her ikisinde de (uluslararası kariyer)']),
    metadata: JSON.stringify({ category: 'geography_preference' })
  },
  {
    stageId: 60002, order: 11, type: 'likert', required: true,
    text: 'Teknoloji ve dijital araçları kullanmak sana ne kadar kolay geliyor?',
    options: JSON.stringify(['1 - Çok zorlanıyorum', '2 - Biraz zorlanıyorum', '3 - Orta düzeyde', '4 - Kolay geliyor', '5 - Çok kolay, teknoloji meraklısıyım']),
    metadata: JSON.stringify({ category: 'digital_literacy' })
  },
  {
    stageId: 60002, order: 12, type: 'multiple_choice', required: true,
    text: 'Aşağıdaki aktivitelerden hangilerinde kendini yetenekli hissediyorsun? (Birden fazla seçebilirsin)',
    options: JSON.stringify(['Bir şeyi sökme ve tekrar birleştirme (teknik beceri)', 'Birine bir konuyu öğretme veya anlatma', 'Karmaşık problemleri analiz etme', 'Yaratıcı projeler geliştirme (resim, müzik, yazı)', 'Organizasyon ve plan yapma', 'İnsanları ikna etme ve motive etme', 'Doğa/hayvanlarla ilgilenme', 'Rakamlar ve verilerle çalışma']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'talent_discovery' })
  },
  {
    stageId: 60002, order: 13, type: 'multiple_choice', required: false,
    text: 'Hangi yabancı dilleri öğrenmek istersin veya öğreniyorsun?',
    options: JSON.stringify(['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'Arapça', 'Japonca / Korece / Çince', 'Rusça', 'Başka bir dil']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'language_interest' })
  },
  {
    stageId: 60002, order: 14, type: 'likert', required: true,
    text: 'Başkalarına yardım etmek ve onların sorunlarını çözmek seni ne kadar mutlu ediyor?',
    options: JSON.stringify(['1 - Hiç mutlu etmiyor', '2 - Biraz', '3 - Orta düzeyde', '4 - Oldukça mutlu ediyor', '5 - Çok mutlu ediyor, en sevdiğim şey']),
    metadata: JSON.stringify({ category: 'social_orientation' })
  },
  {
    stageId: 60002, order: 15, type: 'text', required: true,
    text: 'Şimdiye kadar başardığın ve kendinle gurur duyduğun bir şeyi anlat. (Okul projesi, spor başarısı, yardım ettiğin biri vb.)',
    options: null,
    metadata: JSON.stringify({ category: 'achievement_reflection' })
  }
];

// ETAP 3 (60003): Gerçeklik Kontrolü ve Eylem Planı (14-17)
const etap3_14_17 = [
  {
    stageId: 60003, order: 1, type: 'text', required: true,
    text: 'Hedef mesleğin nedir? Bu mesleği seçmenin en önemli 2 nedeni nedir?',
    options: null,
    metadata: JSON.stringify({ category: 'career_goal' })
  },
  {
    stageId: 60003, order: 2, type: 'text', required: true,
    text: 'Hedef üniversiten ve okumak istediğin bölüm nedir?',
    options: null,
    metadata: JSON.stringify({ category: 'university_goal' })
  },
  {
    stageId: 60003, order: 3, type: 'multiple_choice', required: true,
    text: 'Hedef bölümüne girmek için gereken TYT/AYT puan türü nedir?',
    options: JSON.stringify(['SAY (Sayısal - Matematik, Fen)', 'SÖZ (Sözel - Türkçe, Sosyal)', 'EA (Eşit Ağırlık)', 'DİL (Yabancı Dil)', 'Özel yetenek sınavı (Güzel Sanatlar, Spor)', 'Bilmiyorum']),
    metadata: JSON.stringify({ category: 'exam_awareness' })
  },
  {
    stageId: 60003, order: 4, type: 'likert', required: true,
    text: 'Hedef bölümüne girmek için gereken puanı alabileceğine ne kadar inanıyorsun?',
    options: JSON.stringify(['1 - Hiç inanmıyorum', '2 - Biraz zor görünüyor', '3 - Orta düzeyde inanıyorum', '4 - Büyük ihtimalle başarabilirim', '5 - Kesinlikle başarabilirim']),
    metadata: JSON.stringify({ category: 'self_efficacy' })
  },
  {
    stageId: 60003, order: 5, type: 'multiple_choice', required: false,
    text: 'Ailenizin aylık gelir düzeyi hangi aralıkta? (Bu bilgi kariyer planlamanıza yardımcı olacaktır)',
    options: JSON.stringify(['Asgari ücret ve altı', 'Asgari ücretin 1-2 katı', 'Asgari ücretin 2-4 katı', 'Asgari ücretin 4+ katı', 'Belirtmek istemiyorum']),
    metadata: JSON.stringify({ category: 'financial_context' })
  },
  {
    stageId: 60003, order: 6, type: 'multiple_choice', required: true,
    text: 'Üniversite eğitimini nasıl finanse etmeyi planlıyorsun?',
    options: JSON.stringify(['Aile desteği', 'Devlet bursu (KYK vb.)', 'Özel burs (vakıf, kurum)', 'Yarı zamanlı çalışarak', 'Kredi çekerek', 'Henüz düşünmedim']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'financial_plan' })
  },
  {
    stageId: 60003, order: 7, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğinde yapay zeka ve teknoloji değişiminin etkisini nasıl değerlendiriyorsun?',
    options: JSON.stringify(['Bu meslek AI tarafından tamamen değişecek/yok olacak', 'Bu meslek önemli ölçüde değişecek ama devam edecek', 'Bu meslek az etkilenecek', 'Bu meslek AI ile daha güçlenecek', 'Bilmiyorum, araştırmadım']),
    metadata: JSON.stringify({ category: 'ai_awareness' })
  },
  {
    stageId: 60003, order: 8, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğinle ilgili bir profesyonelle (o alanda çalışan biriyle) hiç konuştun mu?',
    options: JSON.stringify(['Evet, birden fazla kez konuştum', 'Evet, bir kez konuştum', 'Hayır ama planım var', 'Hayır ve böyle bir planım yok']),
    metadata: JSON.stringify({ category: 'professional_exposure' })
  },
  {
    stageId: 60003, order: 9, type: 'likert', required: true,
    text: 'Hedef mesleğinin günlük iş hayatı hakkında ne kadar bilgi sahibisin?',
    options: JSON.stringify(['1 - Hiç bilgim yok', '2 - Çok az bilgim var', '3 - Genel bir fikrim var', '4 - Oldukça bilgiliyim', '5 - Çok detaylı bilgim var']),
    metadata: JSON.stringify({ category: 'career_knowledge' })
  },
  {
    stageId: 60003, order: 10, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğinde Türkiye\'deki ortalama başlangıç maaşı hakkında ne düşünüyorsun?',
    options: JSON.stringify(['Asgari ücret civarında', 'Asgari ücretin 1.5-2 katı', 'Asgari ücretin 2-3 katı', 'Asgari ücretin 3-5 katı', 'Çok yüksek (5+ katı)', 'Bilmiyorum']),
    metadata: JSON.stringify({ category: 'salary_expectation' })
  },
  {
    stageId: 60003, order: 11, type: 'text', required: true,
    text: 'Hedef mesleğine ulaşmak için önümüzdeki 1 yılda atacağın 3 somut adım nedir?',
    options: null,
    metadata: JSON.stringify({ category: 'action_plan' })
  },
  {
    stageId: 60003, order: 12, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğine ulaşmada en büyük engelin ne olduğunu düşünüyorsun?',
    options: JSON.stringify(['Sınav puanı yetersizliği', 'Maddi imkansızlıklar', 'Aile baskısı / farklı beklentiler', 'Bilgi ve rehberlik eksikliği', 'Özgüven eksikliği', 'Motivasyon eksikliği', 'Coğrafi kısıtlamalar', 'Engel görmüyorum']),
    metadata: JSON.stringify({ category: 'perceived_barriers' })
  },
  {
    stageId: 60003, order: 13, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğine ulaşamazsan alternatif planın nedir?',
    options: JSON.stringify(['Benzer bir meslek seçerim', 'Tamamen farklı bir alana geçerim', 'Kendi işimi kurarım', 'Yurt dışında eğitim/iş ararım', 'Henüz düşünmedim', 'Mutlaka başaracağım, alternatif düşünmüyorum']),
    metadata: JSON.stringify({ category: 'plan_b' })
  },
  {
    stageId: 60003, order: 14, type: 'likert', required: true,
    text: 'Kariyer hedefine ulaşmak için ne kadar kararlısın?',
    options: JSON.stringify(['1 - Çok kararsızım, sürekli değişiyor', '2 - Biraz kararsızım', '3 - Orta düzeyde kararlıyım', '4 - Oldukça kararlıyım', '5 - Çok kararlıyım, hiçbir şey beni durduramaz']),
    metadata: JSON.stringify({ category: 'determination' })
  },
  {
    stageId: 60003, order: 15, type: 'text', required: false,
    text: 'Kariyer değerlendirme sürecinde öğrendiğin en önemli şey neydi? Mentörüne iletmek istediğin bir mesaj var mı?',
    options: null,
    metadata: JSON.stringify({ category: 'reflection' })
  }
];

// ============================================================
// YAŞ GRUBU: 18-21 (ÜNİVERSİTE ODAKLI)
// Tema: Kariyer hazırlığı, staj, profesyonel gelişim
// Dil: Profesyonel ama samimi, yönlendirici
// ============================================================

// ETAP 1 (60004): Kariyer Hazırlık ve Yetkinlik Değerlendirmesi (18-21)
const etap1_18_21 = [
  {
    stageId: 60004, order: 1, type: 'multiple_choice', required: true,
    text: 'Şu an hangi eğitim/kariyer aşamasındasınız?',
    options: JSON.stringify(['Lise son sınıf, üniversite hazırlığı', 'Üniversite 1. veya 2. sınıf', 'Üniversite 3. veya 4. sınıf', 'Üniversite mezunu, iş arıyorum', 'Çalışıyorum ve kariyer değişikliği düşünüyorum']),
    metadata: JSON.stringify({ category: 'current_status' })
  },
  {
    stageId: 60004, order: 2, type: 'text', required: true,
    text: 'Okuduğunuz veya okumak istediğiniz bölüm nedir? Bu bölümü neden seçtiniz?',
    options: null,
    metadata: JSON.stringify({ category: 'education_choice' })
  },
  {
    stageId: 60004, order: 3, type: 'likert', required: true,
    text: 'Üniversite eğitiminizi kariyer hazırlığı açısından ne kadar yeterli buluyorsunuz?',
    options: JSON.stringify(['1 - Hiç yeterli değil, pratik bilgi eksik', '2 - Yetersiz, çok teorik', '3 - Kısmen yeterli', '4 - Oldukça yeterli', '5 - Çok yeterli, iş hayatına hazır hissediyorum']),
    metadata: JSON.stringify({ category: 'education_satisfaction' })
  },
  {
    stageId: 60004, order: 4, type: 'multiple_choice', required: true,
    text: 'Şimdiye kadar hangi iş deneyimleriniz oldu? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify(['Staj yaptım (zorunlu)', 'Staj yaptım (gönüllü)', 'Part-time çalıştım', 'Freelance/serbest çalıştım', 'Kendi küçük işimi kurdum', 'Gönüllü çalışma yaptım', 'Online freelance (Fiverr, Upwork vb.)', 'Henüz iş deneyimim yok']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'work_experience' })
  },
  {
    stageId: 60004, order: 5, type: 'likert', required: true,
    text: 'İngilizce dil yeterliliğinizi nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Hiç bilmiyorum', '2 - Temel düzey (A1-A2)', '3 - Orta düzey (B1-B2)', '4 - İleri düzey (C1)', '5 - Anadil seviyesi (C2)']),
    metadata: JSON.stringify({ category: 'language_proficiency' })
  },
  {
    stageId: 60004, order: 6, type: 'multiple_choice', required: true,
    text: 'Kariyer hedeflerinizi ne kadar netleştirdiniz?',
    options: JSON.stringify(['Çok net: Hangi sektörde, hangi pozisyonda çalışacağımı biliyorum', 'Oldukça net: Sektörü biliyorum ama pozisyon belirsiz', 'Biraz net: Genel bir alan var ama detaylar belirsiz', 'Belirsiz: Birkaç farklı seçenek arasında kararsızım', 'Hiç net değil: Ne yapmak istediğimi bilmiyorum']),
    metadata: JSON.stringify({ category: 'career_clarity' })
  },
  {
    stageId: 60004, order: 7, type: 'multiple_choice', required: true,
    text: 'Hangi profesyonel becerilere sahip olduğunuzu düşünüyorsunuz? (Birden fazla seçin)',
    options: JSON.stringify(['Analitik düşünme ve problem çözme', 'Yazılı ve sözlü iletişim', 'Takım çalışması ve işbirliği', 'Proje yönetimi', 'Veri analizi ve yorumlama', 'Dijital araçlar ve teknoloji', 'Sunum ve ikna etme', 'Liderlik ve motivasyon', 'Araştırma ve raporlama']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'professional_skills' })
  },
  {
    stageId: 60004, order: 8, type: 'likert', required: true,
    text: 'İş piyasasına girdiğinizde ne kadar hazır hissediyorsunuz?',
    options: JSON.stringify(['1 - Hiç hazır değilim', '2 - Biraz hazırım', '3 - Kısmen hazırım', '4 - Oldukça hazırım', '5 - Tamamen hazırım']),
    metadata: JSON.stringify({ category: 'job_readiness' })
  },
  {
    stageId: 60004, order: 9, type: 'multiple_choice', required: true,
    text: 'Kariyer planlamasında en büyük endişeniz nedir?',
    options: JSON.stringify(['İş bulamama / işsizlik', 'Düşük maaş', 'Yanlış alan seçimi', 'Yeterli deneyim/staj eksikliği', 'Rekabet çok yüksek', 'Aile baskısı ve beklentiler', 'Yurt dışı fırsatlarını kaçırma', 'Yapay zekanın işimi alması']),
    metadata: JSON.stringify({ category: 'career_anxiety' })
  },
  {
    stageId: 60004, order: 10, type: 'text', required: true,
    text: '5 yıl sonra kendinizi nerede görüyorsunuz? Kariyer açısından somut bir hedef belirtin.',
    options: null,
    metadata: JSON.stringify({ category: 'five_year_vision' })
  },
  {
    stageId: 60004, order: 11, type: 'multiple_choice', required: true,
    text: 'LinkedIn profiliniz var mı ve aktif olarak kullanıyor musunuz?',
    options: JSON.stringify(['Evet, aktif kullanıyorum (düzenli paylaşım, bağlantı kurma)', 'Evet, var ama aktif değilim', 'Var ama hiç kullanmıyorum', 'Yok ama oluşturmayı düşünüyorum', 'Yok ve gerekli görmüyorum']),
    metadata: JSON.stringify({ category: 'digital_presence' })
  },
  {
    stageId: 60004, order: 12, type: 'likert', required: true,
    text: 'Kariyer hedeflerinize ulaşmak için ne kadar çaba harcamaya hazırsınız?',
    options: JSON.stringify(['1 - Minimum çaba, kolay yollar ararım', '2 - Biraz çaba', '3 - Makul çaba', '4 - Yoğun çaba', '5 - Her türlü fedakarlığa hazırım']),
    metadata: JSON.stringify({ category: 'effort_willingness' })
  },
  {
    stageId: 60004, order: 13, type: 'multiple_choice', required: true,
    text: 'Üniversite hayatında hangi ekstra aktivitelere katıldınız? (Birden fazla seçin)',
    options: JSON.stringify(['Öğrenci kulübü / topluluk', 'Staj / iş deneyimi', 'Yarışma / hackathon', 'Erasmus / değişim programı', 'Gönüllülük / sosyal sorumluluk', 'Sertifika programı / online kurs', 'Kendi projelerim (blog, uygulama, girişim)', 'Hiçbiri']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'university_activities' })
  },
  {
    stageId: 60004, order: 14, type: 'multiple_choice', required: true,
    text: 'Hangi çalışma modelini tercih edersiniz?',
    options: JSON.stringify(['Tam zamanlı ofis çalışması', 'Hibrit (ofis + uzaktan)', 'Tamamen uzaktan çalışma', 'Freelance / serbest çalışma', 'Kendi işimi kurmak', 'Kamu sektörü / devlet memurluğu']),
    metadata: JSON.stringify({ category: 'work_model_preference' })
  },
  {
    stageId: 60004, order: 15, type: 'text', required: true,
    text: 'Kendinizi 3 kelimeyle tanımlayın ve bu kelimelerin kariyer seçiminizi nasıl etkilediğini açıklayın.',
    options: null,
    metadata: JSON.stringify({ category: 'self_description' })
  }
];

// ETAP 2 (60005): Profesyonel Yetenek ve Eğilim Analizi (18-21)
const etap2_18_21 = [
  {
    stageId: 60005, order: 1, type: 'multiple_choice', required: true,
    text: 'Hangi sektörlerde kariyer yapmayı düşünüyorsunuz? (En fazla 3 seçin)',
    options: JSON.stringify(['Teknoloji / Yazılım / Yapay Zeka', 'Sağlık / Tıp / Biyoteknoloji', 'Finans / Bankacılık / Yatırım', 'Eğitim / Akademi / Araştırma', 'Hukuk / Kamu Yönetimi', 'Medya / İletişim / Pazarlama', 'Mühendislik / İnşaat / Enerji', 'Sanat / Tasarım / Yaratıcı endüstriler', 'Girişimcilik / Startup', 'E-ticaret / Dijital pazarlama']),
    metadata: JSON.stringify({ allowMultiple: true, maxSelect: 3, category: 'sector_interest' })
  },
  {
    stageId: 60005, order: 2, type: 'likert', required: true,
    text: 'Liderlik pozisyonlarına ne kadar ilgi duyuyorsunuz?',
    options: JSON.stringify(['1 - Hiç ilgi duymuyorum, takımda çalışmayı tercih ederim', '2 - Az ilgi duyuyorum', '3 - Duruma göre değişiyor', '4 - Oldukça ilgi duyuyorum', '5 - Güçlü liderlik hedeflerim var']),
    metadata: JSON.stringify({ category: 'leadership_aspiration' })
  },
  {
    stageId: 60005, order: 3, type: 'multiple_choice', required: true,
    text: 'Hangi teknik becerilere sahipsiniz veya geliştirmeyi planlıyorsunuz? (Birden fazla seçin)',
    options: JSON.stringify(['Programlama (Python, Java, JavaScript vb.)', 'Veri analizi / İstatistik / Excel', 'Grafik tasarım / UI-UX', 'Dijital pazarlama / SEO / Sosyal medya', 'Muhasebe / Finansal analiz', 'Proje yönetimi (PMP, Agile, Scrum)', 'Yabancı dil (İngilizce dışı)', 'Araştırma ve akademik yazım', 'Video düzenleme / İçerik üretimi']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'technical_skills' })
  },
  {
    stageId: 60005, order: 4, type: 'likert', required: true,
    text: 'Belirsizlik ve değişimle başa çıkma konusunda kendinizi nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zorlanıyorum, istikrar isterim', '2 - Biraz zorlanıyorum', '3 - Orta düzeyde başa çıkabilirim', '4 - İyi başa çıkıyorum', '5 - Değişim ve belirsizliği seviyorum']),
    metadata: JSON.stringify({ category: 'adaptability' })
  },
  {
    stageId: 60005, order: 5, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminiz için şimdiye kadar hangi adımları attınız? (Birden fazla seçin)',
    options: JSON.stringify(['Online kurs tamamladım (Coursera, Udemy vb.)', 'Sertifika programına katıldım', 'Mentorluk aldım', 'Kariyer fuarına katıldım', 'Networking etkinliklerine katıldım', 'Kişisel proje/portföy oluşturdum', 'CV ve LinkedIn profilimi hazırladım', 'Henüz somut bir adım atmadım']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'career_actions' })
  },
  {
    stageId: 60005, order: 6, type: 'ranking', required: true,
    text: 'Aşağıdaki kariyer faktörlerini önem sırasına göre sıralayın (1=En önemli)',
    options: JSON.stringify(['Yüksek maaş ve maddi güvence', 'İş-yaşam dengesi', 'Kariyer gelişim fırsatları', 'Toplumsal etki ve anlam', 'Uluslararası fırsatlar']),
    metadata: JSON.stringify({ category: 'career_priorities' })
  },
  {
    stageId: 60005, order: 7, type: 'text', required: true,
    text: 'Şimdiye kadar en zorlandığınız profesyonel veya akademik deneyim neydi? Bu deneyimden ne öğrendiniz?',
    options: null,
    metadata: JSON.stringify({ category: 'challenge_reflection' })
  },
  {
    stageId: 60005, order: 8, type: 'multiple_choice', required: true,
    text: 'Girişimcilik veya kendi işinizi kurma konusunda ne düşünüyorsunuz?',
    options: JSON.stringify(['Kesinlikle kendi işimi kurmak istiyorum', 'Birkaç yıl deneyim sonra girişim yapmayı düşünüyorum', 'Belki, ama önce güvenli bir iş istiyorum', 'Girişimcilik benim için değil, kurumsal kariyer tercih ederim', 'Henüz düşünmedim']),
    metadata: JSON.stringify({ category: 'entrepreneurship' })
  },
  {
    stageId: 60005, order: 9, type: 'likert', required: true,
    text: 'Ağ oluşturma (networking) ve profesyonel ilişkiler kurma konusunda ne kadar aktifsiniz?',
    options: JSON.stringify(['1 - Hiç aktif değilim', '2 - Çok az', '3 - Orta düzeyde', '4 - Aktifim', '5 - Çok aktifim, sürekli yeni bağlantılar kuruyorum']),
    metadata: JSON.stringify({ category: 'networking' })
  },
  {
    stageId: 60005, order: 10, type: 'multiple_choice', required: true,
    text: 'Yapay zeka ve otomasyon trendleri kariyer planlamanızı nasıl etkiliyor?',
    options: JSON.stringify(['AI\'ya dayanıklı alanlara yöneliyorum', 'AI ile çalışmayı öğrenmeye odaklanıyorum', 'AI konusunu henüz yeterince düşünmedim', 'AI benim sektörümü etkilemez diye düşünüyorum', 'AI beni endişelendiriyor ama ne yapacağımı bilmiyorum']),
    metadata: JSON.stringify({ category: 'ai_strategy' })
  },
  {
    stageId: 60005, order: 11, type: 'text', required: true,
    text: 'Hayran olduğunuz bir kariyer figürü veya mentor var mı? Bu kişiden ne öğrenmek istersiniz?',
    options: null,
    metadata: JSON.stringify({ category: 'role_model' })
  },
  {
    stageId: 60005, order: 12, type: 'multiple_choice', required: false,
    text: 'Yüksek lisans veya doktora yapmayı düşünüyor musunuz?',
    options: JSON.stringify(['Evet, Türkiye\'de', 'Evet, yurt dışında', 'Belki, henüz karar vermedim', 'Hayır, iş hayatına geçmeyi tercih ederim', 'Zaten yapıyorum']),
    metadata: JSON.stringify({ category: 'graduate_education' })
  },
  {
    stageId: 60005, order: 13, type: 'multiple_choice', required: true,
    text: 'Gelecekte Türkiye\'de mi yoksa yurt dışında mı çalışmayı düşünüyorsunuz?',
    options: JSON.stringify(['Kesinlikle Türkiye\'de', 'Büyük ihtimalle Türkiye\'de', 'Henüz karar vermedim', 'Büyük ihtimalle yurt dışında', 'Kesinlikle yurt dışında', 'Her ikisinde de (uluslararası kariyer)']),
    metadata: JSON.stringify({ category: 'geography_preference' })
  },
  {
    stageId: 60005, order: 14, type: 'likert', required: true,
    text: 'Kendi güçlü ve zayıf yönlerinizi ne kadar iyi tanıyorsunuz?',
    options: JSON.stringify(['1 - Hiç tanımıyorum', '2 - Çok az', '3 - Orta düzeyde', '4 - İyi tanıyorum', '5 - Çok iyi tanıyorum, sürekli kendimi değerlendiriyorum']),
    metadata: JSON.stringify({ category: 'self_awareness' })
  },
  {
    stageId: 60005, order: 15, type: 'text', required: true,
    text: 'Üniversite eğitiminiz boyunca edindiğiniz en değerli beceri veya deneyim nedir? Bunu kariyerinizde nasıl kullanmayı planlıyorsunuz?',
    options: null,
    metadata: JSON.stringify({ category: 'education_value' })
  }
];

// ETAP 3 (60006): Kariyer Stratejisi ve Eylem Planı (18-21)
const etap3_18_21 = [
  {
    stageId: 60006, order: 1, type: 'text', required: true,
    text: 'Hedef pozisyonunuz ve hedef şirket/sektörünüz nedir? Neden bu pozisyonu seçtiniz?',
    options: null,
    metadata: JSON.stringify({ category: 'target_position' })
  },
  {
    stageId: 60006, order: 2, type: 'multiple_choice', required: true,
    text: 'Hedef pozisyonunuz için gereken niteliklere ne kadar sahipsiniz?',
    options: JSON.stringify(['%80-100: Neredeyse tüm niteliklere sahibim', '%60-80: Büyük çoğunluğuna sahibim', '%40-60: Yarısına sahibim', '%20-40: Azına sahibim, çok çalışmam gerekiyor', '%0-20: Neredeyse hiç niteliğim yok']),
    metadata: JSON.stringify({ category: 'qualification_gap' })
  },
  {
    stageId: 60006, order: 3, type: 'multiple_choice', required: true,
    text: 'CV\'niz ve özgeçmişiniz ne durumda?',
    options: JSON.stringify(['Profesyonel, güncel ve hazır', 'Var ama güncellenmesi gerekiyor', 'Var ama profesyonel değil', 'Yok, henüz oluşturmadım']),
    metadata: JSON.stringify({ category: 'cv_status' })
  },
  {
    stageId: 60006, order: 4, type: 'likert', required: true,
    text: 'İş görüşmesi (mülakat) performansınızı nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zayıf, çok gergin oluyorum', '2 - Zayıf', '3 - Orta düzeyde', '4 - İyi', '5 - Çok güçlüyüm, kendime güveniyorum']),
    metadata: JSON.stringify({ category: 'interview_skills' })
  },
  {
    stageId: 60006, order: 5, type: 'multiple_choice', required: true,
    text: 'Hedef şirketinizde veya sektörünüzde tanıdığınız biri var mı?',
    options: JSON.stringify(['Evet, birden fazla kişi tanıyorum', 'Evet, bir kişi tanıyorum', 'Hayır ama bağlantı kurmaya çalışıyorum', 'Hayır ve bu konuda adım atmadım']),
    metadata: JSON.stringify({ category: 'network_status' })
  },
  {
    stageId: 60006, order: 6, type: 'text', required: true,
    text: 'Önümüzdeki 6 ay için kariyer hedefinize ulaşmak adına atacağınız 5 somut adım nedir?',
    options: null,
    metadata: JSON.stringify({ category: 'six_month_plan' })
  },
  {
    stageId: 60006, order: 7, type: 'multiple_choice', required: true,
    text: 'Mezuniyet sonrası beklediğiniz başlangıç maaşı nedir?',
    options: JSON.stringify(['30.000-40.000 TL', '40.000-60.000 TL', '60.000-80.000 TL', '80.000-100.000 TL', '100.000 TL üzeri', 'Maaştan çok deneyim önemli, esnek düşünüyorum']),
    metadata: JSON.stringify({ category: 'salary_expectation' })
  },
  {
    stageId: 60006, order: 8, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminiz için hangi kaynakları aktif olarak kullanıyorsunuz?',
    options: JSON.stringify(['LinkedIn (içerik takibi, networking)', 'Kariyer platformları (Kariyer.net, Indeed vb.)', 'Sektör yayınları ve bloglar', 'Podcast ve YouTube kanalları', 'Mentorluk programları', 'Mesleki dernekler ve topluluklar', 'Henüz aktif kaynak kullanmıyorum']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'career_resources' })
  },
  {
    stageId: 60006, order: 9, type: 'likert', required: true,
    text: 'Kişisel markanızı (personal branding) ne kadar geliştirdiniz?',
    options: JSON.stringify(['1 - Hiç düşünmedim', '2 - Farkındayım ama başlamadım', '3 - Farkındayım ama aktif çalışmıyorum', '4 - Aktif olarak geliştiriyorum', '5 - Güçlü bir kişisel markam var']),
    metadata: JSON.stringify({ category: 'personal_branding' })
  },
  {
    stageId: 60006, order: 10, type: 'multiple_choice', required: true,
    text: 'Kariyer hedefinize ulaşmada en büyük engel nedir?',
    options: JSON.stringify(['Deneyim eksikliği', 'Ağ/bağlantı eksikliği', 'Teknik beceri eksikliği', 'Özgüven eksikliği', 'Finansal kısıtlamalar', 'Coğrafi kısıtlamalar', 'Aile baskısı', 'Piyasa koşulları']),
    metadata: JSON.stringify({ category: 'career_barrier' })
  },
  {
    stageId: 60006, order: 11, type: 'text', required: true,
    text: 'Kariyer yolculuğunuzda size ilham veren bir başarı hikayesi veya deneyim var mı? Anlatın.',
    options: null,
    metadata: JSON.stringify({ category: 'inspiration' })
  },
  {
    stageId: 60006, order: 12, type: 'multiple_choice', required: true,
    text: '10 yıl sonra kendinizi hangi kariyer aşamasında görüyorsunuz?',
    options: JSON.stringify(['Kendi şirketimin sahibi/ortağı', 'Üst düzey yönetici (Direktör, VP, C-level)', 'Alanında uzman/danışman', 'Akademisyen/araştırmacı', 'Uluslararası kariyer (yurt dışında)', 'Sosyal girişimci/sivil toplum lideri', 'Henüz bu kadar uzağı düşünmedim']),
    metadata: JSON.stringify({ category: 'long_term_vision' })
  },
  {
    stageId: 60006, order: 13, type: 'multiple_choice', required: true,
    text: 'Yapay zeka dönüşümüne karşı kariyer stratejiniz nedir?',
    options: JSON.stringify(['AI araçlarını öğrenerek verimliliğimi artıracağım', 'AI\'nın yapamayacağı insani becerilere odaklanacağım', 'AI ile çalışabilecek teknik becerileri geliştireceğim', 'AI\'dan etkilenmeyecek sektörlere yöneleceğim', 'Bu konuyu henüz yeterince düşünmedim']),
    metadata: JSON.stringify({ category: 'ai_career_strategy' })
  },
  {
    stageId: 60006, order: 14, type: 'likert', required: true,
    text: 'Kariyer hedeflerinize ulaşma konusunda ne kadar iyimsersiniz?',
    options: JSON.stringify(['1 - Çok kötümserim', '2 - Biraz endişeliyim', '3 - Orta düzeyde iyimserim', '4 - Oldukça iyimserim', '5 - Çok iyimserim, başaracağıma inanıyorum']),
    metadata: JSON.stringify({ category: 'career_optimism' })
  },
  {
    stageId: 60006, order: 15, type: 'text', required: false,
    text: 'Kariyer değerlendirme sürecinde size en çok yardımcı olan içgörü neydi? Mentörünüze iletmek istediğiniz bir mesaj var mı?',
    options: null,
    metadata: JSON.stringify({ category: 'reflection' })
  }
];

// ============================================================
// YAŞ GRUBU: 22-24 (KARİYER ODAKLI)
// Tema: İş deneyimi, liderlik, stratejik planlama
// Dil: Profesyonel, stratejik, derinlemesine
// ============================================================

// ETAP 1 (60007): Kariyer Geçiş ve Yetkinlik Değerlendirmesi (22-24)
const etap1_22_24 = [
  {
    stageId: 60007, order: 1, type: 'multiple_choice', required: true,
    text: 'Şu anki durumunuzu en iyi hangisi tanımlıyor?',
    options: JSON.stringify(['Yeni mezun, ilk işimi arıyorum', 'İlk işimde çalışıyorum (1-2 yıl)', 'Kariyer değişikliği düşünüyorum', 'İşsizim ve yeni fırsatlar arıyorum', 'Serbest çalışıyorum/freelance', 'Kendi işimi kurdum veya kurmak istiyorum']),
    metadata: JSON.stringify({ category: 'current_status' })
  },
  {
    stageId: 60007, order: 2, type: 'text', required: true,
    text: 'Mezun olduğunuz bölüm ve şu an çalıştığınız/çalışmak istediğiniz alan nedir? Aralarında bir bağlantı var mı?',
    options: null,
    metadata: JSON.stringify({ category: 'education_career_alignment' })
  },
  {
    stageId: 60007, order: 3, type: 'likert', required: true,
    text: 'Şu anki kariyer yolunuzdan ne kadar memnunsunuz?',
    options: JSON.stringify(['1 - Hiç memnun değilim, değişiklik istiyorum', '2 - Memnun değilim', '3 - Orta düzeyde memnunum', '4 - Oldukça memnunum', '5 - Çok memnunum, doğru yoldayım']),
    metadata: JSON.stringify({ category: 'career_satisfaction' })
  },
  {
    stageId: 60007, order: 4, type: 'multiple_choice', required: true,
    text: 'İş hayatında şimdiye kadar hangi deneyimleri edindiniz? (Birden fazla seçin)',
    options: JSON.stringify(['Kurumsal şirkette çalıştım', 'KOBİ/küçük işletmede çalıştım', 'Startup\'ta çalıştım', 'Kamu sektöründe çalıştım', 'Freelance/danışmanlık yaptım', 'Uluslararası şirkette çalıştım', 'Kendi işimi kurdum', 'Henüz iş deneyimim yok']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'work_experience' })
  },
  {
    stageId: 60007, order: 5, type: 'multiple_choice', required: true,
    text: 'Hangi profesyonel yetkinliklerinizin güçlü olduğunu düşünüyorsunuz? (En fazla 4 seçin)',
    options: JSON.stringify(['Stratejik düşünme ve planlama', 'Veri analizi ve karar verme', 'Proje yönetimi', 'Takım liderliği ve motivasyon', 'Müşteri ilişkileri ve satış', 'Teknik/mühendislik becerileri', 'Yaratıcılık ve inovasyon', 'Finansal analiz ve bütçeleme', 'İletişim ve sunum', 'Uluslararası iş geliştirme']),
    metadata: JSON.stringify({ allowMultiple: true, maxSelect: 4, category: 'core_competencies' })
  },
  {
    stageId: 60007, order: 6, type: 'likert', required: true,
    text: 'Mevcut sektörünüzde uzun vadeli kariyer yapmak istiyor musunuz?',
    options: JSON.stringify(['1 - Kesinlikle hayır, değişmek istiyorum', '2 - Muhtemelen hayır', '3 - Kararsızım', '4 - Muhtemelen evet', '5 - Kesinlikle evet, bu sektörde uzmanlaşacağım']),
    metadata: JSON.stringify({ category: 'sector_commitment' })
  },
  {
    stageId: 60007, order: 7, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde en büyük boşluk nerede olduğunu düşünüyorsunuz?',
    options: JSON.stringify(['Teknik beceriler', 'Liderlik ve yönetim becerileri', 'Ağ/network eksikliği', 'Uluslararası deneyim', 'Üst düzey eğitim (MBA, yüksek lisans)', 'Sektör değişikliği için gereken bilgi', 'Özgüven ve kişisel gelişim']),
    metadata: JSON.stringify({ category: 'skill_gap' })
  },
  {
    stageId: 60007, order: 8, type: 'text', required: true,
    text: 'Kariyer yolculuğunuzda şimdiye kadar aldığınız en önemli karar neydi? Sonucu nasıl oldu?',
    options: null,
    metadata: JSON.stringify({ category: 'career_decision' })
  },
  {
    stageId: 60007, order: 9, type: 'likert', required: true,
    text: 'Mevcut maaşınızdan ve çalışma koşullarınızdan ne kadar memnunsunuz?',
    options: JSON.stringify(['1 - Hiç memnun değilim', '2 - Memnun değilim', '3 - Orta düzeyde memnunum', '4 - Oldukça memnunum', '5 - Çok memnunum']),
    metadata: JSON.stringify({ category: 'compensation_satisfaction' })
  },
  {
    stageId: 60007, order: 10, type: 'multiple_choice', required: true,
    text: 'Önümüzdeki 2 yılda kariyer hedefleriniz nedir?',
    options: JSON.stringify(['Terfi almak / yönetici pozisyonuna geçmek', 'Daha iyi bir şirkete geçmek', 'Tamamen farklı bir sektöre geçmek', 'Kendi işimi kurmak', 'Yurt dışında çalışmak', 'Yüksek lisans/MBA yapmak', 'Uzman/danışman olmak']),
    metadata: JSON.stringify({ category: 'two_year_goal' })
  },
  {
    stageId: 60007, order: 11, type: 'likert', required: true,
    text: 'İş-yaşam dengesini ne kadar sağlayabiliyorsunuz?',
    options: JSON.stringify(['1 - Hiç sağlayamıyorum', '2 - Zor sağlıyorum', '3 - Orta düzeyde', '4 - İyi sağlıyorum', '5 - Çok iyi dengeliyorum']),
    metadata: JSON.stringify({ category: 'work_life_balance' })
  },
  {
    stageId: 60007, order: 12, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminiz için bir mentora veya koça ihtiyaç duyuyor musunuz?',
    options: JSON.stringify(['Evet, aktif olarak mentor arıyorum', 'Evet, ihtiyacım var ama nasıl bulacağımı bilmiyorum', 'Zaten bir mentorum var', 'Hayır, kendi kendime ilerleyebilirim', 'Henüz düşünmedim']),
    metadata: JSON.stringify({ category: 'mentorship_need' })
  },
  {
    stageId: 60007, order: 13, type: 'multiple_choice', required: true,
    text: 'Şu anki pozisyonunuzda hangi becerileri en çok kullanıyorsunuz?',
    options: JSON.stringify(['Analitik düşünme / veri analizi', 'İletişim / sunum', 'Proje yönetimi / organizasyon', 'Teknik / mühendislik becerileri', 'Satış / müşteri ilişkileri', 'Yaratıcılık / tasarım', 'Liderlik / ekip yönetimi', 'Henüz çalışmıyorum']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'current_skills_used' })
  },
  {
    stageId: 60007, order: 14, type: 'likert', required: true,
    text: 'Profesyonel ağınızın (network) gücünü nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zayıf, neredeyse hiç bağlantım yok', '2 - Zayıf', '3 - Orta düzeyde', '4 - Güçlü', '5 - Çok güçlü, geniş ve aktif bir ağım var']),
    metadata: JSON.stringify({ category: 'network_strength' })
  },
  {
    stageId: 60007, order: 15, type: 'text', required: true,
    text: 'Kendinizi 3 yıl sonra hangi pozisyonda ve hangi şirkette/sektörde görüyorsunuz? Bu hedefe ulaşmak için en kritik adım nedir?',
    options: null,
    metadata: JSON.stringify({ category: 'three_year_vision' })
  }
];

// ETAP 2 (60008): Profesyonel Gelişim ve Liderlik Analizi (22-24)
const etap2_22_24 = [
  {
    stageId: 60008, order: 1, type: 'multiple_choice', required: true,
    text: 'Liderlik tarzınızı en iyi hangisi tanımlıyor?',
    options: JSON.stringify(['Vizyoner: Büyük resmi görür, ilham veririm', 'Koçluk yapan: Ekibi geliştirmeye odaklanırım', 'Demokratik: Katılımcı karar alma süreçleri', 'Sonuç odaklı: Hedeflere ulaşmak önceliğim', 'Hizmet eden: Ekibimin başarısı için çalışırım', 'Henüz liderlik deneyimim yok']),
    metadata: JSON.stringify({ category: 'leadership_style' })
  },
  {
    stageId: 60008, order: 2, type: 'likert', required: true,
    text: 'Karmaşık iş problemlerini çözme konusunda kendinizi nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zorlanıyorum', '2 - Zorlanıyorum', '3 - Orta düzeyde başa çıkabiliyorum', '4 - İyi başa çıkıyorum', '5 - Güçlü bir problem çözücüyüm']),
    metadata: JSON.stringify({ category: 'problem_solving' })
  },
  {
    stageId: 60008, order: 3, type: 'multiple_choice', required: true,
    text: 'Hangi sektörel trendlerin kariyerinizi en çok etkileyeceğini düşünüyorsunuz?',
    options: JSON.stringify(['Yapay zeka ve otomasyon', 'Sürdürülebilirlik ve yeşil ekonomi', 'Uzaktan çalışma ve dijital dönüşüm', 'Küreselleşme ve uluslararası rekabet', 'Demografik değişimler', 'Düzenleyici değişiklikler (hukuk, finans)', 'Teknolojik disruption (kendi sektörümde)']),
    metadata: JSON.stringify({ category: 'trend_awareness' })
  },
  {
    stageId: 60008, order: 4, type: 'text', required: true,
    text: 'Şimdiye kadar yönettiğiniz veya liderlik ettiğiniz bir proje veya ekip deneyimini anlatın. Sonuçlar nasıldı?',
    options: null,
    metadata: JSON.stringify({ category: 'leadership_experience' })
  },
  {
    stageId: 60008, order: 5, type: 'likert', required: true,
    text: 'Çatışma yönetimi ve zor konuşmalar yapma konusunda ne kadar kendinizi hazır hissediyorsunuz?',
    options: JSON.stringify(['1 - Çatışmadan kaçınırım', '2 - Zorlanırım', '3 - Duruma göre başa çıkabiliyorum', '4 - İyi yönetebiliyorum', '5 - Çatışmaları yapıcı şekilde yönetebiliyorum']),
    metadata: JSON.stringify({ category: 'conflict_management' })
  },
  {
    stageId: 60008, order: 6, type: 'multiple_choice', required: true,
    text: 'Hangi alanlarda kendinizi geliştirmek için aktif adım atıyorsunuz? (Birden fazla seçin)',
    options: JSON.stringify(['Teknik sertifikasyon (AWS, PMP, CFA vb.)', 'Yönetim ve liderlik eğitimi', 'Yabancı dil geliştirme', 'Networking ve ilişki yönetimi', 'Kişisel marka ve dijital varlık', 'Finansal okuryazarlık', 'Sağlık ve enerji yönetimi', 'Henüz aktif gelişim adımı atmıyorum']),
    metadata: JSON.stringify({ allowMultiple: true, category: 'active_development' })
  },
  {
    stageId: 60008, order: 7, type: 'ranking', required: true,
    text: 'Uzun vadeli kariyer başarısı için aşağıdaki faktörleri önem sırasına göre sıralayın',
    options: JSON.stringify(['Teknik uzmanlık', 'Liderlik ve yönetim becerileri', 'Güçlü profesyonel ağ', 'Sürekli öğrenme ve adaptasyon', 'Duygusal zeka ve ilişki yönetimi']),
    metadata: JSON.stringify({ category: 'success_factors' })
  },
  {
    stageId: 60008, order: 8, type: 'likert', required: true,
    text: 'Sektörünüzdeki gelişmeleri takip etme ve güncel kalma konusunda ne kadar aktifsiniz?',
    options: JSON.stringify(['1 - Hiç takip etmiyorum', '2 - Nadiren', '3 - Zaman zaman takip ediyorum', '4 - Düzenli takip ediyorum', '5 - Çok aktif takip ediyorum, sektör liderlerini takip ederim']),
    metadata: JSON.stringify({ category: 'industry_awareness' })
  },
  {
    stageId: 60008, order: 9, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde en çok hangi kaynaktan faydalanıyorsunuz?',
    options: JSON.stringify(['Mentorluk ve koçluk', 'Profesyonel eğitim ve kurslar', 'Kitap ve akademik kaynaklar', 'Podcast ve video içerikler', 'Mesleki topluluklar ve dernekler', 'Deneyimli meslektaşlardan öğrenme', 'Kendi deneyim ve hatalarımdan']),
    metadata: JSON.stringify({ category: 'learning_resources' })
  },
  {
    stageId: 60008, order: 10, type: 'text', required: true,
    text: '3 yıl sonra hangi pozisyonda olmak istiyorsunuz? Bu hedefe ulaşmak için eksik olduğunuz en kritik 2 şey nedir?',
    options: null,
    metadata: JSON.stringify({ category: 'gap_analysis' })
  },
  {
    stageId: 60008, order: 11, type: 'multiple_choice', required: true,
    text: 'Girişimcilik veya intrapreneurship (kurum içi girişimcilik) konusundaki tutumunuz nedir?',
    options: JSON.stringify(['Aktif olarak girişim planlıyorum', 'Kısa vadede değil ama uzun vadede düşünüyorum', 'Kurum içi girişimcilik (intrapreneurship) daha cazip', 'Kurumsal kariyer yolunu tercih ediyorum', 'Risk almaktan kaçınıyorum']),
    metadata: JSON.stringify({ category: 'entrepreneurship_attitude' })
  },
  {
    stageId: 60008, order: 12, type: 'likert', required: true,
    text: 'Uluslararası kariyer fırsatlarına ne kadar açıksınız?',
    options: JSON.stringify(['1 - Hiç açık değilim, Türkiye\'de kalmak istiyorum', '2 - Çok az', '3 - Doğru fırsat olursa değerlendiririm', '4 - Oldukça açığım', '5 - Aktif olarak uluslararası fırsat arıyorum']),
    metadata: JSON.stringify({ category: 'international_openness' })
  },
  {
    stageId: 60008, order: 13, type: 'multiple_choice', required: true,
    text: 'İş hayatında en çok hangi durumlarla zorlanıyorsunuz?',
    options: JSON.stringify(['Üst yönetimle iletişim', 'Ekip içi çatışmalar', 'Zaman yönetimi ve önceliklendirme', 'İş yükü ve stres yönetimi', 'Kariyer ilerlemesi belirsizliği', 'Maaş ve yan haklar müzakeresi', 'İş-yaşam dengesi', 'Hiçbiriyle zorlanmıyorum']),
    metadata: JSON.stringify({ category: 'workplace_challenges' })
  },
  {
    stageId: 60008, order: 14, type: 'likert', required: true,
    text: 'Duygusal zekanızı (EQ) nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok düşük, duygularımı yönetmekte zorlanıyorum', '2 - Düşük', '3 - Orta düzeyde', '4 - Yüksek', '5 - Çok yüksek, kendimi ve başkalarını iyi anlıyorum']),
    metadata: JSON.stringify({ category: 'emotional_intelligence' })
  },
  {
    stageId: 60008, order: 15, type: 'text', required: true,
    text: 'İş hayatında edindiğiniz en değerli ders nedir? Bu dersi nasıl uygulamaya koyuyorsunuz?',
    options: null,
    metadata: JSON.stringify({ category: 'career_lesson' })
  }
];

// ETAP 3 (60009): Kariyer Optimizasyonu ve Uzun Vadeli Planlama (22-24)
const etap3_22_24 = [
  {
    stageId: 60009, order: 1, type: 'text', required: true,
    text: 'Kariyer hedefinizi ve bu hedefe ulaşmak için izleyeceğiniz stratejiyi özetleyin.',
    options: null,
    metadata: JSON.stringify({ category: 'career_strategy' })
  },
  {
    stageId: 60009, order: 2, type: 'multiple_choice', required: true,
    text: 'Önümüzdeki 5 yılda kariyer gelişiminiz için en kritik yatırım hangisi olacak?',
    options: JSON.stringify(['MBA veya yüksek lisans', 'Uluslararası deneyim (yurt dışı çalışma)', 'Teknik sertifikasyon ve uzmanlaşma', 'Kendi işimi kurmak', 'Güçlü bir network oluşturmak', 'Sektör değişikliği ve yeniden eğitim', 'Liderlik ve yönetim programları']),
    metadata: JSON.stringify({ category: 'career_investment' })
  },
  {
    stageId: 60009, order: 3, type: 'likert', required: true,
    text: 'Finansal bağımsızlık ve kariyer güvencesi konusunda ne kadar hazır hissediyorsunuz?',
    options: JSON.stringify(['1 - Hiç hazır değilim', '2 - Az hazırım', '3 - Orta düzeyde hazırım', '4 - Oldukça hazırım', '5 - Çok hazırım, sağlam bir temele sahibim']),
    metadata: JSON.stringify({ category: 'financial_readiness' })
  },
  {
    stageId: 60009, order: 4, type: 'multiple_choice', required: true,
    text: 'Kariyer yolculuğunuzda en büyük başarınız nedir?',
    options: JSON.stringify(['Hedef şirkete/pozisyona girdim', 'Önemli bir projeyi başarıyla tamamladım', 'Liderlik pozisyonuna yükseldim', 'Kendi işimi kurdum', 'Uluslararası deneyim edindim', 'Değerli bir ağ oluşturdum', 'Henüz büyük bir başarı elde etmedim']),
    metadata: JSON.stringify({ category: 'biggest_achievement' })
  },
  {
    stageId: 60009, order: 5, type: 'text', required: true,
    text: 'Kariyer yolculuğunuzda sizi en çok zorlayan deneyim neydi? Bu deneyim size ne öğretti?',
    options: null,
    metadata: JSON.stringify({ category: 'challenge_learning' })
  },
  {
    stageId: 60009, order: 6, type: 'multiple_choice', required: true,
    text: 'Yapay zeka dönüşümüne karşı kariyer stratejiniz nedir?',
    options: JSON.stringify(['AI\'nın yapamayacağı yaratıcı/insani becerilere odaklanıyorum', 'AI araçlarını öğrenerek verimliliğimi artırıyorum', 'AI ile çalışabilecek teknik becerileri geliştiriyorum', 'AI\'dan etkilenmeyecek sektörlere yöneliyorum', 'Bu konuyu henüz yeterince düşünmedim']),
    metadata: JSON.stringify({ category: 'ai_strategy' })
  },
  {
    stageId: 60009, order: 7, type: 'likert', required: true,
    text: 'Kariyer hedeflerinize ulaşmak için gerekli öz disiplin ve motivasyona ne kadar sahipsiniz?',
    options: JSON.stringify(['1 - Çok düşük, motive olmakta zorlanıyorum', '2 - Düşük', '3 - Orta düzeyde', '4 - Yüksek', '5 - Çok yüksek, hedeflerime odaklanmış durumdayım']),
    metadata: JSON.stringify({ category: 'self_discipline' })
  },
  {
    stageId: 60009, order: 8, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde size en çok kim destek oluyor?',
    options: JSON.stringify(['Mentor veya kariyer koçu', 'Aile ve yakın çevre', 'Meslektaşlar ve iş arkadaşları', 'Profesyonel topluluklar', 'Online kaynaklar ve içerikler', 'Kimse, tamamen kendi kendime ilerleyiyorum']),
    metadata: JSON.stringify({ category: 'support_system' })
  },
  {
    stageId: 60009, order: 9, type: 'text', required: true,
    text: 'Önümüzdeki 12 ay için kariyer hedefinize ulaşmak adına atacağınız somut 5 adımı yazın. Her adım için bir zaman çerçevesi belirtin.',
    options: null,
    metadata: JSON.stringify({ category: 'twelve_month_plan' })
  },
  {
    stageId: 60009, order: 10, type: 'multiple_choice', required: true,
    text: '10 yıl sonra kendinizi nerede görüyorsunuz?',
    options: JSON.stringify(['Kendi şirketimin kurucusu/CEO\'su', 'Büyük bir şirketin üst yöneticisi', 'Alanında tanınan uzman/danışman', 'Akademisyen ve araştırmacı', 'Uluslararası kariyer (küresel şirket)', 'Sosyal etki odaklı kariyer (NGO, sosyal girişim)', 'Birden fazla gelir kaynağı olan portfolio kariyer']),
    metadata: JSON.stringify({ category: 'ten_year_vision' })
  },
  {
    stageId: 60009, order: 11, type: 'likert', required: true,
    text: 'Kariyer yolculuğunuzda ne kadar risk almaya hazırsınız?',
    options: JSON.stringify(['1 - Hiç risk almak istemiyorum, güvenli yolu tercih ederim', '2 - Çok az risk', '3 - Hesaplı riskler alabilirim', '4 - Önemli riskler alabilirim', '5 - Büyük fırsatlar için büyük riskler alabilirim']),
    metadata: JSON.stringify({ category: 'risk_tolerance' })
  },
  {
    stageId: 60009, order: 12, type: 'multiple_choice', required: true,
    text: 'Mevcut maaşınızı piyasa ortalamasıyla karşılaştırdığınızda ne düşünüyorsunuz?',
    options: JSON.stringify(['Piyasa ortalamasının çok altında', 'Piyasa ortalamasının biraz altında', 'Piyasa ortalamasında', 'Piyasa ortalamasının biraz üstünde', 'Piyasa ortalamasının çok üstünde', 'Bilmiyorum / Karşılaştırmadım', 'Henüz çalışmıyorum']),
    metadata: JSON.stringify({ category: 'salary_benchmark' })
  },
  {
    stageId: 60009, order: 13, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde hangi alanda en çok yatırım yapmayı planlıyorsunuz?',
    options: JSON.stringify(['Teknik beceriler ve sertifikalar', 'Liderlik ve yönetim eğitimi', 'Networking ve ilişki geliştirme', 'Kişisel marka oluşturma', 'Yabancı dil geliştirme', 'Girişimcilik hazırlığı', 'Sağlık ve enerji yönetimi']),
    metadata: JSON.stringify({ category: 'development_investment' })
  },
  {
    stageId: 60009, order: 14, type: 'likert', required: true,
    text: 'Kariyer değerlendirme sürecinin size faydalı olduğunu düşünüyor musunuz?',
    options: JSON.stringify(['1 - Hiç faydalı olmadı', '2 - Az faydalı oldu', '3 - Orta düzeyde faydalı oldu', '4 - Oldukça faydalı oldu', '5 - Çok faydalı oldu, kendimi daha iyi tanıdım']),
    metadata: JSON.stringify({ category: 'assessment_value' })
  },
  {
    stageId: 60009, order: 15, type: 'text', required: false,
    text: 'Kariyer değerlendirme sürecinde öğrendiğiniz en önemli içgörü neydi? Mentörünüze iletmek istediğiniz bir mesaj var mı?',
    options: null,
    metadata: JSON.stringify({ category: 'final_reflection' })
  }
];

// Tüm soruları birleştir
const allQuestions = [
  ...etap1_14_17, ...etap2_14_17, ...etap3_14_17,
  ...etap1_18_21, ...etap2_18_21, ...etap3_18_21,
  ...etap1_22_24, ...etap2_22_24, ...etap3_22_24
];

console.log(`Toplam ${allQuestions.length} soru eklenecek...`);

// Soruları veritabanına ekle
let inserted = 0;
for (const q of allQuestions) {
  await conn.query(
    `INSERT INTO questions (stageId, text, type, options, required, \`order\`, metadata, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [q.stageId, q.text, q.type, q.options, q.required ? 1 : 0, q.order, q.metadata || null]
  );
  inserted++;
}

console.log(`✅ ${inserted} soru başarıyla eklendi!`);

// Özet
const [counts] = await conn.query('SELECT stageId, COUNT(*) as count FROM questions GROUP BY stageId ORDER BY stageId');
console.log('\nEtap başına soru sayıları:');
for (const row of counts) {
  const stage = {
    60001: 'Etap 1 (14-17)', 60002: 'Etap 2 (14-17)', 60003: 'Etap 3 (14-17)',
    60004: 'Etap 1 (18-21)', 60005: 'Etap 2 (18-21)', 60006: 'Etap 3 (18-21)',
    60007: 'Etap 1 (22-24)', 60008: 'Etap 2 (22-24)', 60009: 'Etap 3 (22-24)',
    90001: 'Etap 4 (14-17)', 90002: 'Etap 4 (18-21)', 90003: 'Etap 4 (22-24)',
    90004: 'Etap 5 (14-17)', 90005: 'Etap 5 (18-21)', 90006: 'Etap 5 (22-24)'
  }[row.stageId] || `Stage ${row.stageId}`;
  console.log(`  ${stage}: ${row.count} soru`);
}

await conn.end();
