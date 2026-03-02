/**
 * Etap 1 - Yaş Grubuna Özel Soru Güncelleme Script'i
 * 
 * 14-17 yaş: Meslek Seçimi Yetkinlik Değerlendirmesi
 *   → Lise öğrencisine özgü: ders tercihleri, hobiler, aile beklentileri, YKS/bölüm seçimi
 * 
 * 18-21 yaş: Kariyer Hazırlık ve Yetkinlik Değerlendirmesi
 *   → Üniversite öğrencisine özgü: bölüm memnuniyeti, staj, kulüp, çift anadal
 * 
 * 22-24 yaş: Kariyer Geçiş ve Yetkinlik Değerlendirmesi
 *   → Yeni mezun/genç profesyonel: iş deneyimi, kariyer geçişi, maaş beklentisi
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ============================================================
// ETAP 1 - 14-17 YAŞ (stageId: 60001)
// Meslek Seçimi Yetkinlik Değerlendirmesi
// ============================================================
const stage1_1417 = [
  {
    order: 1,
    text: "Okulda en çok hangi dersleri seviyorsun? (En fazla 3 seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Matematik",
      "Fizik",
      "Kimya",
      "Biyoloji",
      "Tarih / Coğrafya",
      "Türkçe / Edebiyat",
      "İngilizce / Yabancı Dil",
      "Bilişim / Teknoloji",
      "Beden Eğitimi / Spor",
      "Müzik / Görsel Sanatlar"
    ]),
    required: true
  },
  {
    order: 2,
    text: "Boş zamanlarında en çok ne yapmaktan keyif alırsın? (En fazla 3 seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Resim çizmek / el sanatları yapmak",
      "Müzik aleti çalmak veya şarkı söylemek",
      "Spor yapmak / antrenman",
      "Bilgisayar / kodlama / oyun geliştirme",
      "Kitap okumak / hikaye yazmak",
      "Arkadaşlarıma yardım etmek / sorunlarını dinlemek",
      "Doğada vakit geçirmek / hayvanlarla ilgilenmek",
      "Matematik / bulmaca çözmek",
      "Video / fotoğraf çekmek / içerik üretmek",
      "Sosyal medya / topluluk yönetimi"
    ]),
    required: true
  },
  {
    order: 3,
    text: "Sınıfta ya da grup çalışmalarında genellikle hangi rolü üstlenirsin?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Lider: Grubu organize eder, kararları ben alırım",
      "Fikir üretici: Yaratıcı çözümler öneririm",
      "Araştırmacı: Bilgi toplar, analiz yaparım",
      "Uygulayıcı: Planlananı titizlikle hayata geçiririm",
      "Arabulucu: Grup içi uyumu sağlarım",
      "Takipçi: Grubun kararlarına uyarım"
    ]),
    required: true
  },
  {
    order: 4,
    text: "Gelecekte çalışmak istediğin ortam hangisine daha yakın?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Ofis ortamı (masa başı, bilgisayar)",
      "Saha / dışarıda aktif çalışma",
      "Hastane / klinik / sağlık ortamı",
      "Okul / eğitim ortamı",
      "Atölye / laboratuvar / üretim alanı",
      "Sahne / stüdyo / yaratıcı ortam",
      "Uzaktan / evden çalışma",
      "Henüz bilmiyorum"
    ]),
    required: true
  },
  {
    order: 5,
    text: "Ailen senden hangi mesleği yapmanı bekliyor?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Doktor / Mühendis / Avukat (klasik prestijli meslekler)",
      "Öğretmen / Akademisyen",
      "İş insanı / Girişimci",
      "Sanatçı / Sporcu / Yaratıcı alan",
      "Devlet memuru / Kamu görevlisi",
      "Ailemin beklentisi yok, kendi kararımı veriyorum",
      "Aile baskısı var ama farklı bir şey istiyorum"
    ]),
    required: true
  },
  {
    order: 6,
    text: "Üniversite sınavına (YKS) ne kadar hazırlıklı hissediyorsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç hazır değilim, nereden başlayacağımı bilmiyorum",
      "2",
      "3 - Orta düzeyde, bazı eksiklerim var",
      "4",
      "5 - Çok hazırım, düzenli çalışıyorum"
    ]),
    required: true
  },
  {
    order: 7,
    text: "Hangi üniversite bölümlerini düşünüyorsun? (Birden fazla seçebilirsin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Tıp / Diş Hekimliği / Eczacılık",
      "Mühendislik (Bilgisayar, Makine, Elektrik vb.)",
      "Hukuk",
      "İşletme / Ekonomi / Finans",
      "Öğretmenlik / Eğitim",
      "Psikoloji / Sosyoloji / Sosyal Bilimler",
      "Güzel Sanatlar / Tasarım / Mimarlık",
      "İletişim / Medya / Gazetecilik",
      "Spor Bilimleri",
      "Henüz karar vermedim"
    ]),
    required: true
  },
  {
    order: 8,
    text: "Bir meslek seçerken sana en önemli gelen faktör nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Yüksek maaş ve maddi güvence",
      "Topluma faydalı olmak",
      "Yaratıcılık ve özgürlük",
      "Prestij ve toplumsal saygınlık",
      "İş güvencesi ve istikrar",
      "Sevdiğim şeyi yapabilmek",
      "Dünyayı gezmek / uluslararası fırsatlar"
    ]),
    required: true
  },
  {
    order: 9,
    text: "Zorlu bir matematik problemi veya bulmacayla karşılaştığında ne yaparsın?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Çözene kadar üzerinde çalışmaya devam ederim, vazgeçmem",
      "Bir süre uğraşırım, sonra yardım isterim",
      "Hemen yardım isterim, zaman kaybetmek istemem",
      "Farklı bir yol denerim, yaratıcı çözüm ararım",
      "Genellikle bu tür problemlerden kaçınırım"
    ]),
    required: true
  },
  {
    order: 10,
    text: "Okul dışında herhangi bir kursa, kulübe veya etkinliğe katılıyor musun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Evet, spor kulübü / takımı",
      "Evet, müzik / sanat kursu",
      "Evet, kodlama / robotik / teknoloji kulübü",
      "Evet, dil kursu (İngilizce, Almanca vb.)",
      "Evet, münazara / tiyatro / sosyal kulüp",
      "Evet, gönüllülük / sivil toplum çalışması",
      "Hayır, okul dışında bir etkinliğe katılmıyorum"
    ]),
    required: false
  },
  {
    order: 11,
    text: "Hayatta seni en çok motive eden şey nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Başarı ve hedeflere ulaşmak",
      "Başkalarına yardım etmek ve fark yaratmak",
      "Yeni şeyler öğrenmek ve keşfetmek",
      "Tanınmak ve takdir görmek",
      "Özgür ve bağımsız olmak",
      "Güvende ve istikrarlı bir hayat sürmek",
      "Yaratıcılığımı ifade etmek"
    ]),
    required: true
  },
  {
    order: 12,
    text: "Eğer bir gün kendi işini kursaydın, ne tür bir iş kurardın? Kısaca açıkla.",
    type: "text",
    options: null,
    required: false
  }
];

// ============================================================
// ETAP 1 - 18-21 YAŞ (stageId: 60004)
// Kariyer Hazırlık ve Yetkinlik Değerlendirmesi
// ============================================================
const stage1_1821 = [
  {
    order: 1,
    text: "Şu an ne yapıyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Üniversitede okuyorum (1. veya 2. sınıf)",
      "Üniversitede okuyorum (3. veya 4. sınıf)",
      "Üniversiteden yeni mezun oldum",
      "Üniversiteye hazırlanıyorum (tekrar yıl)",
      "Çalışıyorum ve üniversiteye devam ediyorum",
      "Üniversite okumuyorum, çalışıyorum"
    ]),
    required: true
  },
  {
    order: 2,
    text: "Okuduğun bölümden ne kadar memnunsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç memnun değilim, yanlış seçim yaptım",
      "2",
      "3 - Orta düzeyde, bazı şeylerini seviyorum",
      "4",
      "5 - Çok memnunum, doğru seçim yaptım"
    ]),
    required: true
  },
  {
    order: 3,
    text: "Kariyer hedeflerin ile okuduğun bölüm ne kadar örtüşüyor?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Tam örtüşüyor, bölümüm kariyer hedeflerime doğrudan katkı sağlıyor",
      "Kısmen örtüşüyor, bazı eksikler var",
      "Pek örtüşmüyor, farklı bir alanda kariyer yapmak istiyorum",
      "Henüz net bir kariyer hedefim yok",
      "Çift anadal / yan dal ile eksiklerimi tamamlamaya çalışıyorum"
    ]),
    required: true
  },
  {
    order: 4,
    text: "Şimdiye kadar herhangi bir staj veya iş deneyimi yaşadın mı?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Evet, birden fazla staj yaptım",
      "Evet, bir staj yaptım",
      "Evet, yarı zamanlı çalıştım / çalışıyorum",
      "Henüz staj yapmadım ama bu dönem planlıyorum",
      "Staj fırsatı bulamadım",
      "Staj yapmak istemiyorum, akademik odaklanmak istiyorum"
    ]),
    required: true
  },
  {
    order: 5,
    text: "Üniversitede herhangi bir kulüp, topluluk veya öğrenci organizasyonuna üye misin?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Evet, aktif üyeyim ve liderlik rolü üstlendim",
      "Evet, aktif üyeyim",
      "Evet, üyeyim ama pek aktif değilim",
      "Hayır, ama katılmayı düşünüyorum",
      "Hayır, katılmak istemiyorum"
    ]),
    required: true
  },
  {
    order: 6,
    text: "Hangi teknik veya profesyonel becerilere sahip olduğunu düşünüyorsun? (En fazla 4 seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Programlama / yazılım geliştirme",
      "Veri analizi / Excel / istatistik",
      "Yabancı dil (İngilizce B2+)",
      "Sunum ve iletişim becerileri",
      "Proje yönetimi",
      "Grafik tasarım / UI/UX",
      "Araştırma ve akademik yazarlık",
      "Satış ve müzakere",
      "Sosyal medya yönetimi",
      "Henüz güçlü bir teknik beceri geliştirmedim"
    ]),
    required: true
  },
  {
    order: 7,
    text: "Mezuniyet sonrası ilk 1 yıl için planın nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Büyük bir şirkette işe başlamak",
      "Startup veya KOBİ'de çalışmak",
      "Yüksek lisans yapmak (Türkiye)",
      "Yurt dışında yüksek lisans yapmak",
      "Kendi işimi kurmak",
      "Kamu sektöründe çalışmak (KPSS)",
      "Henüz karar vermedim"
    ]),
    required: true
  },
  {
    order: 8,
    text: "Kariyer seçiminde seni en çok etkileyen faktör nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Yüksek maaş ve maddi güvence",
      "İş-yaşam dengesi",
      "Toplumsal etki ve anlam",
      "Kariyer gelişim fırsatları",
      "Çalışma ortamı ve şirket kültürü",
      "Uluslararası fırsatlar",
      "Aile ve sosyal çevre beklentileri"
    ]),
    required: true
  },
  {
    order: 9,
    text: "Akademik başarın (not ortalaması / GPA) kariyer hedeflerin için yeterli mi?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hayır, notlarım çok düşük ve endişeleniyorum",
      "2",
      "3 - Orta düzeyde, yeterli ama mükemmel değil",
      "4",
      "5 - Evet, notlarım kariyer hedeflerim için yeterince iyi"
    ]),
    required: true
  },
  {
    order: 10,
    text: "Kariyer gelişimin için hangi adımları attın? (Birden fazla seçebilirsin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Online sertifika aldım (Coursera, Udemy, Google vb.)",
      "LinkedIn profilimi oluşturdum / güncelliyorum",
      "Hackathon veya proje yarışmasına katıldım",
      "Kişisel proje veya portföy oluşturdum",
      "Sektör etkinliklerine / konferanslara katıldım",
      "Mentorluk aldım",
      "Henüz somut bir adım atmadım"
    ]),
    required: false
  },
  {
    order: 11,
    text: "Üniversite hayatında seni en çok zorlayan şey nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Akademik baskı ve sınav stresi",
      "Kariyer belirsizliği (ne yapacağımı bilmiyorum)",
      "Finansal zorluklar",
      "Sosyal uyum ve arkadaşlık ilişkileri",
      "Zaman yönetimi",
      "Aile beklentileri ile kendi isteklerim arasındaki çatışma",
      "Motivasyon eksikliği"
    ]),
    required: true
  },
  {
    order: 12,
    text: "5 yıl sonra kendini nerede görüyorsun? Kariyer hedefini kısaca açıkla.",
    type: "text",
    options: null,
    required: true
  }
];

// ============================================================
// ETAP 1 - 22-24 YAŞ (stageId: 60007)
// Kariyer Geçiş ve Yetkinlik Değerlendirmesi
// ============================================================
const stage1_2224 = [
  {
    order: 1,
    text: "Şu anki durumunu en iyi hangisi tanımlıyor?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Yeni mezun, ilk işimi arıyorum",
      "İlk işimde çalışıyorum (0-1 yıl deneyim)",
      "1-2 yıl deneyimim var, kariyer yolumu netleştiriyorum",
      "Kariyer değişikliği düşünüyorum",
      "Yüksek lisans yapıyorum",
      "Girişimcilik / freelance çalışıyorum"
    ]),
    required: true
  },
  {
    order: 2,
    text: "Mezun olduğun bölüm ile şu an çalıştığın / çalışmak istediğin alan arasındaki ilişki nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Tam örtüşüyor, bölümümde çalışıyorum",
      "Kısmen örtüşüyor, ilgili bir alanda çalışıyorum",
      "Hiç örtüşmüyor, farklı bir alanda çalışıyorum / çalışmak istiyorum",
      "Henüz iş bulamadım",
      "Akademik kariyer planlıyorum (yüksek lisans / doktora)"
    ]),
    required: true
  },
  {
    order: 3,
    text: "Şu anki kariyer yolundan ne kadar memnunsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç memnun değilim, köklü bir değişiklik istiyorum",
      "2",
      "3 - Orta düzeyde, bazı şeyleri değiştirmek istiyorum",
      "4",
      "5 - Çok memnunum, doğru yoldayım"
    ]),
    required: true
  },
  {
    order: 4,
    text: "İş hayatında şimdiye kadar hangi deneyimleri edindин? (Birden fazla seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Kurumsal büyük şirkette çalıştım",
      "KOBİ / küçük işletmede çalıştım",
      "Startup'ta çalıştım",
      "Kamu sektöründe çalıştım",
      "Freelance / bağımsız çalıştım",
      "Yurt dışında çalışma / staj deneyimim var",
      "Henüz profesyonel iş deneyimim yok"
    ]),
    required: true
  },
  {
    order: 5,
    text: "Hangi profesyonel yetkinliklerinin güçlü olduğunu düşünüyorsun? (En fazla 4 seçin)",
    type: "multiple_choice",
    options: JSON.stringify([
      "Analitik düşünme ve problem çözme",
      "İletişim ve sunum becerileri",
      "Proje yönetimi ve organizasyon",
      "Teknik / sektöre özgü uzmanlık",
      "Takım çalışması ve işbirliği",
      "Müzakere ve ikna",
      "Veri analizi ve raporlama",
      "Yaratıcılık ve inovasyon"
    ]),
    required: true
  },
  {
    order: 6,
    text: "Mevcut sektörünüzde uzun vadeli kariyer yapmak istiyor musunuz?",
    type: "likert",
    options: JSON.stringify([
      "1 - Kesinlikle hayır, sektör değiştirmek istiyorum",
      "2",
      "3 - Kararsızım, avantaj ve dezavantajları değerlendiriyorum",
      "4",
      "5 - Evet, bu sektörde uzmanlaşmak istiyorum"
    ]),
    required: true
  },
  {
    order: 7,
    text: "Kariyer gelişiminde en büyük boşluğun nerede olduğunu düşünüyorsun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Teknik beceriler (programlama, veri, tasarım vb.)",
      "Liderlik ve yönetim becerileri",
      "Profesyonel ağ (network) eksikliği",
      "Sektör deneyimi ve referans eksikliği",
      "Yabancı dil yeterliliği",
      "Özgüven ve kişisel marka",
      "Akademik / sertifika eksikliği"
    ]),
    required: true
  },
  {
    order: 8,
    text: "Kariyer yolculuğunda şimdiye kadar aldığın en önemli karar neydi? Sonucu nasıl oldu?",
    type: "text",
    options: null,
    required: true
  },
  {
    order: 9,
    text: "Maaş ve çalışma koşullarından ne kadar memnunsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç memnun değilim, acil değişiklik gerekiyor",
      "2",
      "3 - Orta düzeyde, iyileştirme istiyorum",
      "4",
      "5 - Memnunum, piyasa koşullarına uygun"
    ]),
    required: true
  },
  {
    order: 10,
    text: "Önümüzdeki 2 yılda kariyer hedeflerin nedir?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Terfi almak / kıdemli pozisyona geçmek",
      "Daha iyi bir şirkete / sektöre geçmek",
      "Yüksek lisans / MBA yapmak",
      "Yurt dışında çalışmak",
      "Kendi işimi kurmak",
      "Uzmanlaşmak ve sektörde otorite olmak",
      "Henüz net bir hedefim yok"
    ]),
    required: true
  },
  {
    order: 11,
    text: "İş-yaşam dengesini ne kadar sağlayabiliyorsun?",
    type: "likert",
    options: JSON.stringify([
      "1 - Hiç sağlayamıyorum, iş hayatım her şeyi etkiliyor",
      "2",
      "3 - Orta düzeyde, zaman zaman zorlanıyorum",
      "4",
      "5 - İyi bir denge kurabiliyorum"
    ]),
    required: true
  },
  {
    order: 12,
    text: "Kariyer gelişimin için bir mentora veya koça ihtiyaç duyuyor musun?",
    type: "multiple_choice",
    options: JSON.stringify([
      "Evet, aktif olarak mentor arıyorum",
      "Evet, ihtiyacım var ama nasıl bulacağımı bilmiyorum",
      "Zaten bir mentorun var, düzenli görüşüyorum",
      "Belki, ama önce kendi başıma ilerlemek istiyorum",
      "Hayır, mentor desteğine ihtiyaç duymuyorum"
    ]),
    required: false
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

await updateStageQuestions(60001, stage1_1417, 'Etap 1 - 14-17 yaş');
await updateStageQuestions(60004, stage1_1821, 'Etap 1 - 18-21 yaş');
await updateStageQuestions(60007, stage1_2224, 'Etap 1 - 22-24 yaş');

await conn.end();
console.log('\n✅ Etap 1 soruları başarıyla güncellendi!');
console.log('Toplam: 3 etap × 12 soru = 36 soru');
