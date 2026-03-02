/**
 * Meslegim.tr - Kapsamlı Kariyer Değerlendirme Soruları Seed Script
 * 
 * 9 etap için kapsamlı sorular ekler:
 * - 14-17 yaş: Etap 1 (60001), Etap 2 (60002), Etap 3 (60003)
 * - 18-21 yaş: Etap 1 (60004), Etap 2 (60005), Etap 3 (60006)
 * - 22-24 yaş: Etap 1 (60007), Etap 2 (60008), Etap 3 (60009)
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Mevcut soruları sil (seed yeniden çalıştırılabilsin diye)
// Sadece belirtilen stageId'lere ait soruları sil
const stageIds = [60001, 60002, 60003, 60004, 60005, 60006, 60007, 60008, 60009];
await conn.query(`DELETE FROM questions WHERE stageId IN (${stageIds.join(',')})`);
console.log('Mevcut sorular silindi.');

// ============================================================
// YAŞ GRUBU: 14-17
// ============================================================

// ETAP 1 (60001): Meslek Seçimi Yetkinlik Değerlendirmesi
const etap1_14_17 = [
  {
    stageId: 60001, order: 1, type: 'multiple_choice', required: true,
    text: 'Ders dışında en çok hangi aktivitelerden zevk alıyorsunuz? (En fazla 3 seçin)',
    options: JSON.stringify(['Resim/Çizim/El sanatları', 'Müzik aleti çalmak/şarkı söylemek', 'Spor yapmak/antrenman', 'Bilgisayar/teknoloji ile uğraşmak', 'Kitap okumak/hikaye yazmak', 'Arkadaşlarıma yardım etmek/rehberlik', 'Doğada vakit geçirmek/hayvanlarla ilgilenmek', 'Matematik/bulmaca çözmek'])
  },
  {
    stageId: 60001, order: 2, type: 'likert', required: true,
    text: 'Okulda en çok hangi derslerde başarılı olduğunuzu düşünüyorsunuz?',
    options: JSON.stringify(['Sayısal dersler (Matematik, Fizik, Kimya)', 'Sözel dersler (Türkçe, Edebiyat, Tarih)', 'Yabancı dil dersleri', 'Görsel sanatlar/Müzik', 'Beden eğitimi/Spor', 'Bilişim teknolojileri'])
  },
  {
    stageId: 60001, order: 3, type: 'likert', required: true,
    text: 'Kendinizi ne kadar yaratıcı birisi olarak görüyorsunuz?',
    options: JSON.stringify(['1 - Hiç yaratıcı değilim', '2', '3 - Orta düzeyde', '4', '5 - Çok yaratıcıyım'])
  },
  {
    stageId: 60001, order: 4, type: 'multiple_choice', required: true,
    text: 'Bir grup projesinde genellikle hangi rolü üstlenirsiniz?',
    options: JSON.stringify(['Lider/Koordinatör - Grubu yönlendiririm', 'Fikir üretici - Yeni fikirler öneriyorum', 'Uygulayıcı - Planları hayata geçiririm', 'Analist - Detayları inceler, hataları bulurum', 'Destekçi - Diğerlerine yardım ederim', 'Gözlemci - Genellikle sessiz kalırım'])
  },
  {
    stageId: 60001, order: 5, type: 'likert', required: true,
    text: 'Yabancılarla veya yeni insanlarla iletişim kurmak size nasıl geliyor?',
    options: JSON.stringify(['1 - Çok zorlanıyorum', '2', '3 - Duruma göre değişiyor', '4', '5 - Çok kolay geliyor'])
  },
  {
    stageId: 60001, order: 6, type: 'multiple_choice', required: true,
    text: 'Aşağıdaki Holland Mesleki İlgi Tiplerinden hangisi sizi en iyi tanımlar?',
    options: JSON.stringify(['Gerçekçi (Pratik işler, makine, doğa)', 'Araştırmacı (Bilim, analiz, merak)', 'Sanatsal (Yaratıcılık, ifade, özgünlük)', 'Sosyal (İnsanlara yardım, öğretme, bakım)', 'Girişimci (İş kurma, liderlik, risk alma)', 'Geleneksel (Düzen, organizasyon, detay odaklı)'])
  },
  {
    stageId: 60001, order: 7, type: 'likert', required: true,
    text: 'Bir problemi çözerken genellikle nasıl yaklaşırsınız?',
    options: JSON.stringify(['Hemen harekete geçerim, deneme yanılma yaparım', 'Önce araştırır, sonra plan yaparım', 'Başkalarına danışır, birlikte çözerim', 'Sistematik adımlarla ilerlerim', 'Sezgilerime güvenirim'])
  },
  {
    stageId: 60001, order: 8, type: 'text', required: true,
    text: 'Kendinizi hangi üç kelimeyle tanımlarsınız? (Örn: meraklı, sabırlı, yaratıcı)',
    options: null
  },
  {
    stageId: 60001, order: 9, type: 'text', required: true,
    text: 'Hayalinizdeki meslek veya çalışmak istediğiniz alan nedir? Neden bu alanı seçiyorsunuz?',
    options: null
  },
  {
    stageId: 60001, order: 10, type: 'multiple_choice', required: true,
    text: 'Gelecekte nasıl bir çalışma ortamı hayal ediyorsunuz?',
    options: JSON.stringify(['Ofiste, düzenli saatlerle', 'Sahada/dışarıda, hareket halinde', 'Evden/uzaktan çalışarak', 'Kendi işyerimde, bağımsız', 'Hastane/okul/kamu kurumunda', 'Uluslararası, farklı ülkelerde'])
  },
  {
    stageId: 60001, order: 11, type: 'likert', required: true,
    text: 'Başkalarına yardım etmek ve onların sorunlarını çözmek sizi ne kadar mutlu ediyor?',
    options: JSON.stringify(['1 - Hiç mutlu etmiyor', '2', '3 - Orta düzeyde', '4', '5 - Çok mutlu ediyor'])
  },
  {
    stageId: 60001, order: 12, type: 'multiple_choice', required: false,
    text: 'Ailenizde veya çevrenizde hangi meslek gruplarından insanlar var? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify(['Öğretmen/Akademisyen', 'Doktor/Sağlık çalışanı', 'Mühendis/Teknisyen', 'Avukat/Hakim', 'Esnaf/Tüccar/Girişimci', 'Sanatçı/Tasarımcı', 'Memur/Kamu görevlisi', 'Çiftçi/Tarım'])
  }
];

// ETAP 2 (60002): Yetenek Keşfi ve Mesleki Eğilim Analizi (14-17)
const etap2_14_17 = [
  {
    stageId: 60002, order: 1, type: 'multiple_choice', required: true,
    text: 'Aşağıdaki aktivitelerden hangilerinde kendinizi yetenekli hissediyorsunuz? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify(['Bir şeyi sökme ve tekrar birleştirme (teknik beceri)', 'Birine bir konuyu öğretme veya anlatma', 'Karmaşık problemleri analiz etme', 'Yaratıcı projeler geliştirme (resim, müzik, yazı)', 'Organizasyon ve plan yapma', 'İnsanları ikna etme ve motive etme', 'Doğa/hayvanlarla ilgilenme', 'Rakamlar ve verilerle çalışma'])
  },
  {
    stageId: 60002, order: 2, type: 'likert', required: true,
    text: 'Bir konuyu öğrenirken genellikle nasıl öğrenirsiniz? En iyi öğrenme şeklinizi seçin.',
    options: JSON.stringify(['Görerek (video, diyagram, görsel materyal)', 'Duyarak (ders anlatımı, podcast, tartışma)', 'Yaparak (uygulama, deney, pratik)', 'Okuyarak (kitap, makale, not)', 'Başkalarına anlatarak'])
  },
  {
    stageId: 60002, order: 3, type: 'likert', required: true,
    text: 'Zaman baskısı altında ne kadar iyi çalışabilirsiniz?',
    options: JSON.stringify(['1 - Hiç iyi çalışamam, paniklerim', '2', '3 - Duruma göre değişiyor', '4', '5 - Baskı altında daha iyi çalışırım'])
  },
  {
    stageId: 60002, order: 4, type: 'multiple_choice', required: true,
    text: 'Hangi tür görevleri yaparken "zaman nasıl geçti?" diye düşünürsünüz? (Akış hali)',
    options: JSON.stringify(['Bir şeyler tasarlarken veya çizerken', 'Müzik çalarken veya dinlerken', 'Kod yazarken veya bilgisayarla uğraşırken', 'Spor yaparken veya dans ederken', 'Birisiyle derin sohbet ederken', 'Bir problemi çözerken', 'Bir şeyler inşa ederken veya tamir ederken', 'Okurken veya yazarken'])
  },
  {
    stageId: 60002, order: 5, type: 'likert', required: true,
    text: 'Kendinizi ne kadar iyi bir lider olarak görüyorsunuz?',
    options: JSON.stringify(['1 - Hiç liderlik özelliğim yok', '2', '3 - Orta düzeyde', '4', '5 - Güçlü bir liderim'])
  },
  {
    stageId: 60002, order: 6, type: 'ranking', required: true,
    text: 'Aşağıdaki değerleri kariyer seçiminizdeki önem sırasına göre değerlendirin (1=En önemli, 5=En az önemli)',
    options: JSON.stringify(['Yüksek maaş ve maddi güvence', 'Topluma fayda sağlamak', 'Yaratıcılık ve özgürlük', 'Prestij ve statü', 'İş-yaşam dengesi'])
  },
  {
    stageId: 60002, order: 7, type: 'multiple_choice', required: true,
    text: 'Aşağıdaki mesleklerden hangisi sizi en çok heyecanlandırıyor?',
    options: JSON.stringify(['Yazılım geliştirici / Yapay zeka uzmanı', 'Doktor / Psikolog / Hemşire', 'Mimar / İç mimar / Tasarımcı', 'Öğretmen / Akademisyen', 'Avukat / Hakim / Savcı', 'Girişimci / İş insanı', 'Sanatçı / Müzisyen / Yazar', 'Mühendis (inşaat, makine, elektrik)'])
  },
  {
    stageId: 60002, order: 8, type: 'likert', required: true,
    text: 'Yeni bir beceri öğrenmek için ne kadar zaman ve çaba harcamaya hazırsınız?',
    options: JSON.stringify(['1 - Çok az, hızlı sonuç isterim', '2', '3 - Makul süre', '4', '5 - Yıllarca çalışmaya hazırım'])
  },
  {
    stageId: 60002, order: 9, type: 'text', required: true,
    text: 'Şimdiye kadar başardığınız ve kendinizle gurur duyduğunuz bir şeyi anlatın. (Okul projesi, spor başarısı, yardım ettiğiniz biri vb.)',
    options: null
  },
  {
    stageId: 60002, order: 10, type: 'multiple_choice', required: true,
    text: 'Gelecekte Türkiye\'de mi yoksa yurt dışında mı çalışmayı düşünüyorsunuz?',
    options: JSON.stringify(['Kesinlikle Türkiye\'de', 'Büyük ihtimalle Türkiye\'de', 'Henüz karar vermedim', 'Büyük ihtimalle yurt dışında', 'Kesinlikle yurt dışında', 'Her ikisinde de (uluslararası kariyer)'])
  },
  {
    stageId: 60002, order: 11, type: 'likert', required: true,
    text: 'Teknoloji ve dijital araçları kullanmak size ne kadar kolay geliyor?',
    options: JSON.stringify(['1 - Çok zorlanıyorum', '2', '3 - Orta düzeyde', '4', '5 - Çok kolay, teknoloji meraklısıyım'])
  },
  {
    stageId: 60002, order: 12, type: 'multiple_choice', required: false,
    text: 'Hangi yabancı dilleri öğrenmek istersiniz veya öğreniyorsunuz?',
    options: JSON.stringify(['İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'Arapça', 'Japonca/Çince', 'Rusça', 'Başka bir dil'])
  }
];

// ETAP 3 (60003): Gerçeklik Kontrolü ve Eylem Planı (14-17)
const etap3_14_17 = [
  {
    stageId: 60003, order: 1, type: 'text', required: true,
    text: 'Hedef mesleğiniz nedir? Bu mesleği seçmenizin en önemli 2 nedeni nedir?',
    options: null
  },
  {
    stageId: 60003, order: 2, type: 'text', required: true,
    text: 'Hedef üniversiteniz ve okumak istediğiniz bölüm nedir?',
    options: null
  },
  {
    stageId: 60003, order: 3, type: 'multiple_choice', required: true,
    text: 'Hedef bölümünüze girmek için gereken TYT/AYT puan türü nedir?',
    options: JSON.stringify(['SAY (Sayısal - Matematik, Fen)', 'SÖZ (Sözel - Türkçe, Sosyal)', 'EA (Eşit Ağırlık)', 'DİL (Yabancı Dil)', 'Özel yetenek sınavı (Güzel Sanatlar, Spor)', 'Bilmiyorum'])
  },
  {
    stageId: 60003, order: 4, type: 'likert', required: true,
    text: 'Hedef bölümünüze girmek için gereken puanı alabileceğinize ne kadar inanıyorsunuz?',
    options: JSON.stringify(['1 - Hiç inanmıyorum', '2', '3 - Orta düzeyde inanıyorum', '4', '5 - Kesinlikle başarabilirim'])
  },
  {
    stageId: 60003, order: 5, type: 'multiple_choice', required: false,
    text: 'Ailenizin aylık gelir düzeyi hangi aralıkta?',
    options: JSON.stringify(['Asgari ücret ve altı (0-20.000 TL)', 'Asgari ücretin 2 katı (20.000-40.000 TL)', 'Asgari ücretin 3-4 katı (40.000-80.000 TL)', 'Asgari ücretin 5+ katı (80.000 TL üzeri)'])
  },
  {
    stageId: 60003, order: 6, type: 'multiple_choice', required: true,
    text: 'Üniversite eğitiminizi nasıl finanse etmeyi planlıyorsunuz?',
    options: JSON.stringify(['Aile desteği', 'Devlet bursu (KYK vb.)', 'Özel burs (vakıf, kurum)', 'Yarı zamanlı çalışarak', 'Kredi çekerek', 'Henüz düşünmedim'])
  },
  {
    stageId: 60003, order: 7, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğinizde Türkiye\'deki ortalama başlangıç maaşı hakkında ne düşünüyorsunuz?',
    options: JSON.stringify(['Asgari ücretin altında olabilir', 'Asgari ücret civarında (20.000-25.000 TL)', 'Asgari ücretin 2 katı (40.000-50.000 TL)', 'Asgari ücretin 3-4 katı (60.000-80.000 TL)', 'Çok yüksek (100.000 TL+)', 'Bilmiyorum'])
  },
  {
    stageId: 60003, order: 8, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğinizde yapay zeka ve teknoloji değişiminin etkisini nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['Bu meslek AI tarafından tamamen değişecek/yok olacak', 'Bu meslek önemli ölçüde değişecek ama devam edecek', 'Bu meslek az etkilenecek', 'Bu meslek AI ile daha güçlenecek', 'Bilmiyorum, araştırmadım'])
  },
  {
    stageId: 60003, order: 9, type: 'text', required: true,
    text: 'Hedef mesleğinize ulaşmak için önümüzdeki 1 yılda atacağınız 3 somut adım nedir?',
    options: null
  },
  {
    stageId: 60003, order: 10, type: 'multiple_choice', required: true,
    text: 'Hedef mesleğinizle ilgili bir profesyonelle (o alanda çalışan biriyle) hiç konuştunuz mu?',
    options: JSON.stringify(['Evet, birden fazla kez konuştum', 'Evet, bir kez konuştum', 'Hayır ama planım var', 'Hayır ve böyle bir planım yok'])
  },
  {
    stageId: 60003, order: 11, type: 'likert', required: true,
    text: 'Hedef mesleğinizin günlük iş hayatı hakkında ne kadar bilgi sahibisiniz?',
    options: JSON.stringify(['1 - Hiç bilgim yok', '2', '3 - Genel bir fikrim var', '4', '5 - Çok detaylı bilgim var'])
  },
  {
    stageId: 60003, order: 12, type: 'multiple_choice', required: false,
    text: 'Hedef mesleğinize ulaşamazsanız alternatif planınız nedir?',
    options: JSON.stringify(['Benzer bir meslek seçerim', 'Tamamen farklı bir alana geçerim', 'Kendi işimi kurarım', 'Yurt dışında eğitim/iş ararım', 'Henüz düşünmedim', 'Mutlaka başaracağım, alternatifte düşünmüyorum'])
  }
];

// ============================================================
// YAŞ GRUBU: 18-21
// ============================================================

// ETAP 1 (60004): Kariyer Hazırlık ve Yetkinlik Değerlendirmesi (18-21)
const etap1_18_21 = [
  {
    stageId: 60004, order: 1, type: 'multiple_choice', required: true,
    text: 'Şu an hangi eğitim/kariyer aşamasındasınız?',
    options: JSON.stringify(['Lise son sınıf, üniversite hazırlığı', 'Üniversite 1. veya 2. sınıf', 'Üniversite 3. veya 4. sınıf', 'Üniversite mezunu, iş arıyorum', 'Çalışıyorum ve kariyer değişikliği düşünüyorum'])
  },
  {
    stageId: 60004, order: 2, type: 'text', required: true,
    text: 'Okuduğunuz veya okumak istediğiniz bölüm nedir? Bu bölümü neden seçtiniz?',
    options: null
  },
  {
    stageId: 60004, order: 3, type: 'likert', required: true,
    text: 'Üniversite eğitiminizi kariyer hazırlığı açısından ne kadar yeterli buluyorsunuz?',
    options: JSON.stringify(['1 - Hiç yeterli değil', '2', '3 - Kısmen yeterli', '4', '5 - Çok yeterli'])
  },
  {
    stageId: 60004, order: 4, type: 'multiple_choice', required: true,
    text: 'Şimdiye kadar hangi iş deneyimleriniz oldu? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify(['Staj yaptım (zorunlu)', 'Staj yaptım (gönüllü)', 'Part-time çalıştım', 'Freelance/serbest çalıştım', 'Kendi küçük işimi kurdum', 'Gönüllü çalışma yaptım', 'Henüz iş deneyimim yok'])
  },
  {
    stageId: 60004, order: 5, type: 'likert', required: true,
    text: 'İngilizce dil yeterliliğinizi nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Hiç bilmiyorum', '2 - Temel düzey (A1-A2)', '3 - Orta düzey (B1-B2)', '4 - İleri düzey (C1)', '5 - Anadil seviyesi (C2)'])
  },
  {
    stageId: 60004, order: 6, type: 'multiple_choice', required: true,
    text: 'Kariyer hedeflerinizi ne kadar netleştirdiniz?',
    options: JSON.stringify(['Çok net: Hangi sektörde, hangi pozisyonda çalışacağımı biliyorum', 'Oldukça net: Sektörü biliyorum ama pozisyon belirsiz', 'Biraz net: Genel bir alan var ama detaylar belirsiz', 'Belirsiz: Birkaç farklı seçenek arasında kararsızım', 'Hiç net değil: Ne yapmak istediğimi bilmiyorum'])
  },
  {
    stageId: 60004, order: 7, type: 'multiple_choice', required: true,
    text: 'Hangi profesyonel becerilere sahip olduğunuzu düşünüyorsunuz? (Birden fazla seçin)',
    options: JSON.stringify(['Analitik düşünme ve problem çözme', 'Yazılı ve sözlü iletişim', 'Takım çalışması ve işbirliği', 'Proje yönetimi', 'Veri analizi ve yorumlama', 'Dijital araçlar ve teknoloji', 'Sunum ve ikna etme', 'Liderlik ve motivasyon'])
  },
  {
    stageId: 60004, order: 8, type: 'likert', required: true,
    text: 'Mezun olduğunuzda veya şu an iş piyasasına girdiğinizde ne kadar hazır hissediyorsunuz?',
    options: JSON.stringify(['1 - Hiç hazır değilim', '2', '3 - Kısmen hazırım', '4', '5 - Tamamen hazırım'])
  },
  {
    stageId: 60004, order: 9, type: 'multiple_choice', required: true,
    text: 'Kariyer planlamasında en büyük endişeniz nedir?',
    options: JSON.stringify(['İş bulamama / işsizlik', 'Düşük maaş', 'Yanlış alan seçimi', 'Yeterli deneyim/staj eksikliği', 'Rekabet çok yüksek', 'Aile baskısı ve beklentiler', 'Yurt dışı fırsatlarını kaçırma', 'Yapay zekanın işimi alması'])
  },
  {
    stageId: 60004, order: 10, type: 'text', required: true,
    text: '5 yıl sonra kendinizi nerede görüyorsunuz? Kariyer açısından somut bir hedef belirtin.',
    options: null
  },
  {
    stageId: 60004, order: 11, type: 'multiple_choice', required: true,
    text: 'LinkedIn profiliniz var mı ve aktif olarak kullanıyor musunuz?',
    options: JSON.stringify(['Evet, aktif kullanıyorum (düzenli paylaşım, bağlantı kurma)', 'Evet, var ama aktif değilim', 'Var ama hiç kullanmıyorum', 'Yok ama oluşturmayı düşünüyorum', 'Yok ve gerekli görmüyorum'])
  },
  {
    stageId: 60004, order: 12, type: 'likert', required: true,
    text: 'Kariyer hedeflerinize ulaşmak için ne kadar çaba harcamaya hazırsınız?',
    options: JSON.stringify(['1 - Minimum çaba, kolay yollar ararım', '2', '3 - Makul çaba', '4', '5 - Her türlü fedakarlığa hazırım'])
  }
];

// ETAP 2 (60005): Profesyonel Yetenek ve Eğilim Analizi (18-21)
const etap2_18_21 = [
  {
    stageId: 60005, order: 1, type: 'multiple_choice', required: true,
    text: 'Hangi sektörlerde kariyer yapmayı düşünüyorsunuz? (En fazla 3 seçin)',
    options: JSON.stringify(['Teknoloji / Yazılım / Yapay Zeka', 'Sağlık / Tıp / Biyoteknoloji', 'Finans / Bankacılık / Yatırım', 'Eğitim / Akademi / Araştırma', 'Hukuk / Kamu Yönetimi', 'Medya / İletişim / Pazarlama', 'Mühendislik / İnşaat / Enerji', 'Sanat / Tasarım / Yaratıcı endüstriler', 'Girişimcilik / Startup'])
  },
  {
    stageId: 60005, order: 2, type: 'likert', required: true,
    text: 'Liderlik pozisyonlarına ne kadar ilgi duyuyorsunuz?',
    options: JSON.stringify(['1 - Hiç ilgi duymuyorum, takımda çalışmayı tercih ederim', '2', '3 - Duruma göre değişiyor', '4', '5 - Güçlü liderlik hedeflerim var'])
  },
  {
    stageId: 60005, order: 3, type: 'multiple_choice', required: true,
    text: 'Hangi teknik becerilere sahipsiniz veya geliştirmeyi planlıyorsunuz? (Birden fazla seçin)',
    options: JSON.stringify(['Programlama (Python, Java, vb.)', 'Veri analizi / İstatistik', 'Grafik tasarım / UI-UX', 'Dijital pazarlama / SEO', 'Muhasebe / Finansal analiz', 'Proje yönetimi (PMP, Agile)', 'Yabancı dil (İngilizce dışı)', 'Araştırma ve akademik yazım'])
  },
  {
    stageId: 60005, order: 4, type: 'likert', required: true,
    text: 'Belirsizlik ve değişimle başa çıkma konusunda kendinizi nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zorlanıyorum, istikrar isterim', '2', '3 - Orta düzeyde başa çıkabilirim', '4', '5 - Değişim ve belirsizliği seviyorum'])
  },
  {
    stageId: 60005, order: 5, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminiz için şimdiye kadar hangi adımları attınız? (Birden fazla seçin)',
    options: JSON.stringify(['Online kurs tamamladım (Coursera, Udemy vb.)', 'Sertifika programına katıldım', 'Mentorluk aldım veya aldım', 'Kariyer fuarına katıldım', 'Networking etkinliklerine katıldım', 'Kişisel proje/portföy oluşturdum', 'Henüz somut bir adım atmadım'])
  },
  {
    stageId: 60005, order: 6, type: 'ranking', required: true,
    text: 'Aşağıdaki kariyer faktörlerini önem sırasına göre değerlendirin (1=En önemli)',
    options: JSON.stringify(['Yüksek maaş ve maddi güvence', 'İş-yaşam dengesi', 'Kariyer gelişim fırsatları', 'Toplumsal etki ve anlam', 'Uluslararası fırsatlar'])
  },
  {
    stageId: 60005, order: 7, type: 'text', required: true,
    text: 'Şimdiye kadar en zorlandığınız profesyonel veya akademik deneyim neydi? Bu deneyimden ne öğrendiniz?',
    options: null
  },
  {
    stageId: 60005, order: 8, type: 'multiple_choice', required: true,
    text: 'Girişimcilik veya kendi işinizi kurma konusunda ne düşünüyorsunuz?',
    options: JSON.stringify(['Kesinlikle kendi işimi kurmak istiyorum', 'Birkaç yıl deneyim sonra girişim yapmayı düşünüyorum', 'Belki, ama önce güvenli bir iş istiyorum', 'Girişimcilik benim için değil, kurumsal kariyer tercih ederim', 'Henüz düşünmedim'])
  },
  {
    stageId: 60005, order: 9, type: 'likert', required: true,
    text: 'Ağ oluşturma (networking) ve profesyonel ilişkiler kurma konusunda ne kadar aktifsiniz?',
    options: JSON.stringify(['1 - Hiç aktif değilim', '2', '3 - Orta düzeyde', '4', '5 - Çok aktifim, sürekli yeni bağlantılar kuruyorum'])
  },
  {
    stageId: 60005, order: 10, type: 'multiple_choice', required: true,
    text: 'Yapay zeka ve otomasyon trendleri kariyer planlamanızı nasıl etkiliyor?',
    options: JSON.stringify(['AI\'ya dayanıklı alanlara yöneliyorum', 'AI ile çalışmayı öğrenmeye odaklanıyorum', 'AI konusunu henüz yeterince düşünmedim', 'AI benim sektörümü etkilemez diye düşünüyorum', 'AI beni endişelendiriyor ama ne yapacağımı bilmiyorum'])
  },
  {
    stageId: 60005, order: 11, type: 'text', required: true,
    text: 'Hayran olduğunuz bir kariyer figürü veya mentor var mı? Bu kişiden ne öğrenmek istersiniz?',
    options: null
  },
  {
    stageId: 60005, order: 12, type: 'multiple_choice', required: false,
    text: 'Yüksek lisans veya doktora yapmayı düşünüyor musunuz?',
    options: JSON.stringify(['Evet, Türkiye\'de', 'Evet, yurt dışında', 'Belki, henüz karar vermedim', 'Hayır, iş hayatına geçmeyi tercih ederim', 'Zaten yapıyorum'])
  }
];

// ETAP 3 (60006): Kariyer Stratejisi ve Eylem Planı (18-21)
const etap3_18_21 = [
  {
    stageId: 60006, order: 1, type: 'text', required: true,
    text: 'Hedef pozisyonunuz ve hedef şirket/sektörünüz nedir? Neden bu pozisyonu seçtiniz?',
    options: null
  },
  {
    stageId: 60006, order: 2, type: 'multiple_choice', required: true,
    text: 'Hedef pozisyonunuz için gereken niteliklere ne kadar sahipsiniz?',
    options: JSON.stringify(['%80-100: Neredeyse tüm niteliklere sahibim', '%60-80: Büyük çoğunluğuna sahibim', '%40-60: Yarısına sahibim', '%20-40: Azına sahibim, çok çalışmam gerekiyor', '%0-20: Neredeyse hiç niteliğim yok, sıfırdan başlayacağım'])
  },
  {
    stageId: 60006, order: 3, type: 'multiple_choice', required: true,
    text: 'CV\'niz ve özgeçmişiniz ne durumda?',
    options: JSON.stringify(['Profesyonel, güncel ve hazır', 'Var ama güncellenmesi gerekiyor', 'Var ama profesyonel değil', 'Yok, oluşturmadım'])
  },
  {
    stageId: 60006, order: 4, type: 'likert', required: true,
    text: 'İş görüşmesi (mülakat) performansınızı nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zayıf, çok gergin oluyorum', '2', '3 - Orta düzeyde', '4', '5 - Çok güçlüyüm, kendime güveniyorum'])
  },
  {
    stageId: 60006, order: 5, type: 'multiple_choice', required: true,
    text: 'Hedef şirketinizde veya sektörünüzde tanıdığınız biri var mı?',
    options: JSON.stringify(['Evet, birden fazla kişi tanıyorum', 'Evet, bir kişi tanıyorum', 'Hayır ama bağlantı kurmaya çalışıyorum', 'Hayır ve bu konuda adım atmadım'])
  },
  {
    stageId: 60006, order: 6, type: 'text', required: true,
    text: 'Önümüzdeki 6 ay için kariyer hedefinize ulaşmak adına atacağınız 5 somut adım nedir?',
    options: null
  },
  {
    stageId: 60006, order: 7, type: 'multiple_choice', required: true,
    text: 'Mezuniyet sonrası beklediğiniz başlangıç maaşı nedir?',
    options: JSON.stringify(['30.000-40.000 TL', '40.000-60.000 TL', '60.000-80.000 TL', '80.000-100.000 TL', '100.000 TL üzeri', 'Maaştan çok deneyim önemli, esnek düşünüyorum'])
  },
  {
    stageId: 60006, order: 8, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminiz için hangi kaynakları aktif olarak kullanıyorsunuz?',
    options: JSON.stringify(['LinkedIn (içerik takibi, networking)', 'Kariyer platformları (Kariyer.net, Indeed vb.)', 'Sektör yayınları ve bloglar', 'Podcast ve YouTube kanalları', 'Mentorluk programları', 'Mesleki dernekler ve topluluklar', 'Henüz aktif kaynak kullanmıyorum'])
  },
  {
    stageId: 60006, order: 9, type: 'likert', required: true,
    text: 'Kişisel markanızı (personal branding) ne kadar geliştirdiniz?',
    options: JSON.stringify(['1 - Hiç düşünmedim', '2', '3 - Farkındayım ama aktif çalışmıyorum', '4', '5 - Aktif olarak kişisel markamı inşa ediyorum'])
  },
  {
    stageId: 60006, order: 10, type: 'multiple_choice', required: true,
    text: 'Kariyer hedefinize ulaşmada en büyük engel nedir?',
    options: JSON.stringify(['Deneyim eksikliği', 'Ağ/bağlantı eksikliği', 'Teknik beceri eksikliği', 'Özgüven eksikliği', 'Finansal kısıtlamalar', 'Coğrafi kısıtlamalar', 'Aile baskısı', 'Piyasa koşulları'])
  },
  {
    stageId: 60006, order: 11, type: 'text', required: true,
    text: 'Kariyer yolculuğunuzda size ilham veren bir başarı hikayesi veya deneyim var mı? Anlatın.',
    options: null
  },
  {
    stageId: 60006, order: 12, type: 'multiple_choice', required: false,
    text: '10 yıl sonra kendinizi hangi kariyer aşamasında görüyorsunuz?',
    options: JSON.stringify(['Kendi şirketimin sahibi/ortağı', 'Üst düzey yönetici (Direktör, VP, C-level)', 'Alanında uzman/danışman', 'Akademisyen/araştırmacı', 'Uluslararası kariyer (yurt dışında)', 'Sosyal girişimci/sivil toplum lideri', 'Henüz bu kadar uzağı düşünmedim'])
  }
];

// ============================================================
// YAŞ GRUBU: 22-24
// ============================================================

// ETAP 1 (60007): Kariyer Geçiş ve Yetkinlik Değerlendirmesi (22-24)
const etap1_22_24 = [
  {
    stageId: 60007, order: 1, type: 'multiple_choice', required: true,
    text: 'Şu anki durumunuzu en iyi hangisi tanımlıyor?',
    options: JSON.stringify(['Yeni mezun, ilk işimi arıyorum', 'İlk işimde çalışıyorum (1-2 yıl)', 'Kariyer değişikliği düşünüyorum', 'İşsizim ve yeni fırsatlar arıyorum', 'Serbest çalışıyorum/freelance', 'Kendi işimi kurdum veya kurmak istiyorum'])
  },
  {
    stageId: 60007, order: 2, type: 'text', required: true,
    text: 'Mezun olduğunuz bölüm ve şu an çalıştığınız/çalışmak istediğiniz alan nedir? Aralarında bir bağlantı var mı?',
    options: null
  },
  {
    stageId: 60007, order: 3, type: 'likert', required: true,
    text: 'Şu anki kariyer yolunuzdan ne kadar memnunsunuz?',
    options: JSON.stringify(['1 - Hiç memnun değilim, değişiklik istiyorum', '2', '3 - Orta düzeyde memnunum', '4', '5 - Çok memnunum, doğru yoldayım'])
  },
  {
    stageId: 60007, order: 4, type: 'multiple_choice', required: true,
    text: 'İş hayatında şimdiye kadar hangi deneyimleri edindинiz? (Birden fazla seçin)',
    options: JSON.stringify(['Kurumsal şirkette çalıştım', 'KOBİ/küçük işletmede çalıştım', 'Startup\'ta çalıştım', 'Kamu sektöründe çalıştım', 'Freelance/danışmanlık yaptım', 'Uluslararası şirkette çalıştım', 'Kendi işimi kurdum', 'Henüz iş deneyimim yok'])
  },
  {
    stageId: 60007, order: 5, type: 'multiple_choice', required: true,
    text: 'Hangi profesyonel yetkinliklerinizin güçlü olduğunu düşünüyorsunuz? (En fazla 4 seçin)',
    options: JSON.stringify(['Stratejik düşünme ve planlama', 'Veri analizi ve karar verme', 'Proje yönetimi', 'Takım liderliği ve motivasyon', 'Müşteri ilişkileri ve satış', 'Teknik/mühendislik becerileri', 'Yaratıcılık ve inovasyon', 'Finansal analiz ve bütçeleme', 'İletişim ve sunum', 'Uluslararası iş geliştirme'])
  },
  {
    stageId: 60007, order: 6, type: 'likert', required: true,
    text: 'Mevcut sektörünüzde uzun vadeli kariyer yapmak istiyor musunuz?',
    options: JSON.stringify(['1 - Kesinlikle hayır, değişmek istiyorum', '2', '3 - Kararsızım', '4', '5 - Kesinlikle evet, bu sektörde uzmanlaşacağım'])
  },
  {
    stageId: 60007, order: 7, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde en büyük boşluk nerede olduğunu düşünüyorsunuz?',
    options: JSON.stringify(['Teknik beceriler', 'Liderlik ve yönetim becerileri', 'Ağ/network eksikliği', 'Uluslararası deneyim', 'Üst düzey eğitim (MBA, yüksek lisans)', 'Sektör değişikliği için gereken bilgi', 'Özgüven ve kişisel gelişim'])
  },
  {
    stageId: 60007, order: 8, type: 'text', required: true,
    text: 'Kariyer yolculuğunuzda şimdiye kadar aldığınız en önemli karar neydi? Sonucu nasıl oldu?',
    options: null
  },
  {
    stageId: 60007, order: 9, type: 'likert', required: true,
    text: 'Mevcut maaşınızdan ve çalışma koşullarınızdan ne kadar memnunsunuz?',
    options: JSON.stringify(['1 - Hiç memnun değilim', '2', '3 - Orta düzeyde memnunum', '4', '5 - Çok memnunum'])
  },
  {
    stageId: 60007, order: 10, type: 'multiple_choice', required: true,
    text: 'Önümüzdeki 2 yılda kariyer hedefleriniz nedir?',
    options: JSON.stringify(['Terfi almak / yönetici pozisyonuna geçmek', 'Daha iyi bir şirkete geçmek', 'Tamamen farklı bir sektöre geçmek', 'Kendi işimi kurmak', 'Yurt dışında çalışmak', 'Yüksek lisans/MBA yapmak', 'Uzman/danışman olmak'])
  },
  {
    stageId: 60007, order: 11, type: 'likert', required: true,
    text: 'İş-yaşam dengesini ne kadar sağlayabiliyorsunuz?',
    options: JSON.stringify(['1 - Hiç sağlayamıyorum, iş hayatım her şeyi etkiliyor', '2', '3 - Orta düzeyde', '4', '5 - Çok iyi dengeliyorum'])
  },
  {
    stageId: 60007, order: 12, type: 'multiple_choice', required: false,
    text: 'Kariyer gelişiminiz için bir mentora veya koça ihtiyaç duyuyor musunuz?',
    options: JSON.stringify(['Evet, aktif olarak mentor arıyorum', 'Evet, ihtiyacım var ama nasıl bulacağımı bilmiyorum', 'Zaten bir mentorun var', 'Hayır, kendi kendime ilerleyebilirim', 'Henüz düşünmedim'])
  }
];

// ETAP 2 (60008): Profesyonel Gelişim ve Liderlik Analizi (22-24)
const etap2_22_24 = [
  {
    stageId: 60008, order: 1, type: 'multiple_choice', required: true,
    text: 'Liderlik tarzınızı en iyi hangisi tanımlıyor?',
    options: JSON.stringify(['Vizyoner: Büyük resmi görür, ilham veririm', 'Koçluk yapan: Ekibi geliştirmeye odaklanırım', 'Demokratik: Katılımcı karar alma süreçleri', 'Sonuç odaklı: Hedeflere ulaşmak önceliğim', 'Hizmet eden: Ekibimin başarısı için çalışırım', 'Henüz liderlik deneyimim yok'])
  },
  {
    stageId: 60008, order: 2, type: 'likert', required: true,
    text: 'Karmaşık iş problemlerini çözme konusunda kendinizi nasıl değerlendiriyorsunuz?',
    options: JSON.stringify(['1 - Çok zorlanıyorum', '2', '3 - Orta düzeyde başa çıkabiliyorum', '4', '5 - Güçlü bir problem çözücüyüm'])
  },
  {
    stageId: 60008, order: 3, type: 'multiple_choice', required: true,
    text: 'Hangi sektörel trendlerin kariyerinizi en çok etkileyeceğini düşünüyorsunuz?',
    options: JSON.stringify(['Yapay zeka ve otomasyon', 'Sürdürülebilirlik ve yeşil ekonomi', 'Uzaktan çalışma ve dijital dönüşüm', 'Küreselleşme ve uluslararası rekabet', 'Demografik değişimler', 'Düzenleyici değişiklikler (hukuk, finans)', 'Teknolojik disruption (kendi sektörümde)'])
  },
  {
    stageId: 60008, order: 4, type: 'text', required: true,
    text: 'Şimdiye kadar yönettiğiniz veya liderlik ettiğiniz bir proje veya ekip deneyimini anlatın. Sonuçlar nasıldı?',
    options: null
  },
  {
    stageId: 60008, order: 5, type: 'likert', required: true,
    text: 'Çatışma yönetimi ve zor konuşmalar yapma konusunda ne kadar kendinizi hazır hissediyorsunuz?',
    options: JSON.stringify(['1 - Çatışmadan kaçınırım, çok zorlanıyorum', '2', '3 - Duruma göre başa çıkabiliyorum', '4', '5 - Çatışmaları yapıcı şekilde yönetebiliyorum'])
  },
  {
    stageId: 60008, order: 6, type: 'multiple_choice', required: true,
    text: 'Hangi alanlarda kendinizi geliştirmek için aktif adım atıyorsunuz? (Birden fazla seçin)',
    options: JSON.stringify(['Teknik sertifikasyon (AWS, PMP, CFA vb.)', 'Yönetim ve liderlik eğitimi', 'Yabancı dil geliştirme', 'Networking ve ilişki yönetimi', 'Kişisel marka ve dijital varlık', 'Finansal okuryazarlık', 'Sağlık ve enerji yönetimi', 'Henüz aktif gelişim adımı atmıyorum'])
  },
  {
    stageId: 60008, order: 7, type: 'ranking', required: true,
    text: 'Uzun vadeli kariyer başarısı için aşağıdaki faktörleri önem sırasına göre değerlendirin',
    options: JSON.stringify(['Teknik uzmanlık', 'Liderlik ve yönetim becerileri', 'Güçlü profesyonel ağ', 'Sürekli öğrenme ve adaptasyon', 'Duygusal zeka ve ilişki yönetimi'])
  },
  {
    stageId: 60008, order: 8, type: 'likert', required: true,
    text: 'Sektörünüzdeki gelişmeleri takip etme ve güncel kalma konusunda ne kadar aktifsiniz?',
    options: JSON.stringify(['1 - Hiç takip etmiyorum', '2', '3 - Zaman zaman takip ediyorum', '4', '5 - Çok aktif takip ediyorum, sektör liderlerini takip ederim'])
  },
  {
    stageId: 60008, order: 9, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde en çok hangi kaynaktan faydalanıyorsunuz?',
    options: JSON.stringify(['Mentorluk ve koçluk', 'Profesyonel eğitim ve kurslar', 'Kitap ve akademik kaynaklar', 'Podcast ve video içerikler', 'Mesleki topluluklar ve dernekler', 'Deneyimli meslektaşlardan öğrenme', 'Kendi deneyim ve hatalarımdan'])
  },
  {
    stageId: 60008, order: 10, type: 'text', required: true,
    text: '3 yıl sonra hangi pozisyonda olmak istiyorsunuz? Bu hedefe ulaşmak için eksik olduğunuz en kritik 2 şey nedir?',
    options: null
  },
  {
    stageId: 60008, order: 11, type: 'multiple_choice', required: true,
    text: 'Girişimcilik veya intrapreneurship (kurum içi girişimcilik) konusundaki tutumunuz nedir?',
    options: JSON.stringify(['Aktif olarak girişim planlıyorum', 'Kısa vadede değil ama uzun vadede düşünüyorum', 'Kurum içi girişimcilik (intrapreneurship) daha cazip', 'Kurumsal kariyer yolunu tercih ediyorum', 'Risk almaktan kaçınıyorum'])
  },
  {
    stageId: 60008, order: 12, type: 'likert', required: true,
    text: 'Uluslararası kariyer fırsatlarına ne kadar açıksınız?',
    options: JSON.stringify(['1 - Hiç açık değilim, Türkiye\'de kalmak istiyorum', '2', '3 - Doğru fırsat olursa değerlendiririm', '4', '5 - Aktif olarak uluslararası fırsat arıyorum'])
  }
];

// ETAP 3 (60009): Kariyer Optimizasyonu ve Uzun Vadeli Planlama (22-24)
const etap3_22_24 = [
  {
    stageId: 60009, order: 1, type: 'text', required: true,
    text: 'Kariyer hedefinizi ve bu hedefe ulaşmak için izleyeceğiniz stratejiyi özetleyin.',
    options: null
  },
  {
    stageId: 60009, order: 2, type: 'multiple_choice', required: true,
    text: 'Önümüzdeki 5 yılda kariyer gelişiminiz için en kritik yatırım hangisi olacak?',
    options: JSON.stringify(['MBA veya yüksek lisans', 'Uluslararası deneyim (yurt dışı çalışma)', 'Teknik sertifikasyon ve uzmanlaşma', 'Kendi işimi kurmak', 'Güçlü bir network oluşturmak', 'Sektör değişikliği ve yeniden eğitim', 'Liderlik ve yönetim programları'])
  },
  {
    stageId: 60009, order: 3, type: 'likert', required: true,
    text: 'Finansal bağımsızlık ve kariyer güvencesi konusunda ne kadar hazır hissediyorsunuz?',
    options: JSON.stringify(['1 - Hiç hazır değilim, çok endişeleniyorum', '2', '3 - Orta düzeyde hazırım', '4', '5 - Çok hazırım, sağlam bir temele sahibim'])
  },
  {
    stageId: 60009, order: 4, type: 'multiple_choice', required: true,
    text: 'Kariyer yolculuğunuzda en büyük başarınız nedir?',
    options: JSON.stringify(['Hedef şirkete/pozisyona girdim', 'Önemli bir projeyi başarıyla tamamladım', 'Liderlik pozisyonuna yükseldim', 'Kendi işimi kurdum', 'Uluslararası deneyim edindim', 'Değerli bir ağ oluşturdum', 'Henüz büyük bir başarı elde etmedim'])
  },
  {
    stageId: 60009, order: 5, type: 'text', required: true,
    text: 'Kariyer yolculuğunuzda sizi en çok zorlayan deneyim neydi? Bu deneyim size ne öğretti?',
    options: null
  },
  {
    stageId: 60009, order: 6, type: 'multiple_choice', required: true,
    text: 'Yapay zeka dönüşümüne karşı kariyer stratejiniz nedir?',
    options: JSON.stringify(['AI\'nın yapamayacağı yaratıcı/insani becerilere odaklanıyorum', 'AI araçlarını öğrenerek verimliliğimi artırıyorum', 'AI ile çalışabilecek teknik becerileri geliştiriyorum', 'AI\'dan etkilenmeyecek sektörlere yöneliyorum', 'Bu konuyu henüz yeterince düşünmedim'])
  },
  {
    stageId: 60009, order: 7, type: 'likert', required: true,
    text: 'Kariyer hedeflerinize ulaşmak için gerekli öz disiplin ve motivasyona ne kadar sahipsiniz?',
    options: JSON.stringify(['1 - Çok düşük, motive olmakta zorlanıyorum', '2', '3 - Orta düzeyde', '4', '5 - Çok yüksek, hedeflerime odaklanmış durumdayım'])
  },
  {
    stageId: 60009, order: 8, type: 'multiple_choice', required: true,
    text: 'Kariyer gelişiminizde size en çok kim destek oluyor?',
    options: JSON.stringify(['Mentor veya kariyer koçu', 'Aile ve yakın çevre', 'Meslektaşlar ve iş arkadaşları', 'Profesyonel topluluklar', 'Online kaynaklar ve içerikler', 'Kimse, tamamen kendi kendime ilerleyiyorum'])
  },
  {
    stageId: 60009, order: 9, type: 'text', required: true,
    text: 'Önümüzdeki 12 ay için kariyer hedefinize ulaşmak adına atacağınız somut 5 adımı yazın. Her adım için bir zaman çerçevesi belirtin.',
    options: null
  },
  {
    stageId: 60009, order: 10, type: 'multiple_choice', required: true,
    text: '10 yıl sonra kendinizi nerede görüyorsunuz?',
    options: JSON.stringify(['Kendi şirketimin kurucusu/CEO\'su', 'Büyük bir şirketin üst yöneticisi', 'Alanında tanınan uzman/danışman', 'Akademisyen ve araştırmacı', 'Uluslararası kariyer (küresel şirket)', 'Sosyal etki odaklı kariyer (NGO, sosyal girişim)', 'Birden fazla gelir kaynağı olan portfolio kariyer'])
  },
  {
    stageId: 60009, order: 11, type: 'likert', required: true,
    text: 'Kariyer yolculuğunuzda ne kadar risk almaya hazırsınız?',
    options: JSON.stringify(['1 - Hiç risk almak istemiyorum, güvenli yolu tercih ederim', '2', '3 - Hesaplı riskler alabilirim', '4', '5 - Büyük fırsatlar için büyük riskler alabilirim'])
  },
  {
    stageId: 60009, order: 12, type: 'text', required: false,
    text: 'Kariyer değerlendirme sürecinde size en çok yardımcı olan içgörü veya farkındalık neydi? Mentorünüze iletmek istediğiniz bir mesaj var mı?',
    options: null
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
    `INSERT INTO questions (stageId, text, type, options, required, \`order\`, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [q.stageId, q.text, q.type, q.options, q.required ? 1 : 0, q.order]
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
    60007: 'Etap 1 (22-24)', 60008: 'Etap 2 (22-24)', 60009: 'Etap 3 (22-24)'
  }[row.stageId] || `Stage ${row.stageId}`;
  console.log(`  ${stage}: ${row.count} soru`);
}

await conn.end();
