/**
 * Etap 3 Sorularını Yaş Grubuna Özel İçerikle Güncelle
 * 
 * Stage IDs:
 *   60003 → Etap 3, 14-17 yaş → "Gerçeklik Kontrolü ve Eylem Planı"
 *   60006 → Etap 3, 18-21 yaş → "Kariyer Stratejisi ve Eylem Planı"
 *   60009 → Etap 3, 22-24 yaş → "Kariyer Optimizasyonu ve Uzun Vadeli Planlama"
 */

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─────────────────────────────────────────────────────────────────────────────
// 14-17 YAŞ GRUBU — Etap 3: Gerçeklik Kontrolü ve Eylem Planı (stageId: 60003)
// Odak: Lise son sınıf / üniversite sınavı hazırlığı, bölüm seçimi, aile baskısı,
//        finansal gerçeklik, alternatif planlar
// ─────────────────────────────────────────────────────────────────────────────
const questions1417 = [
  {
    order: 1,
    type: 'text',
    text: 'Hayalinizdeki meslek nedir ve bu mesleği seçmenizin en önemli iki nedeni nedir? (Ailenizin beklentilerinden bağımsız, kendi görüşünüzü yazın.)',
    options: null,
    required: true,
  },
  {
    order: 2,
    type: 'multiple_choice',
    text: 'Hedeflediğiniz üniversite bölümü hangi puan türünü gerektiriyor?',
    options: JSON.stringify([
      'SAY (Sayısal) – Mühendislik, Tıp, Fen',
      'SÖZ (Sözel) – Hukuk, Edebiyat, Tarih',
      'EA (Eşit Ağırlık) – İşletme, Psikoloji, Sosyal Bilimler',
      'DİL – Yabancı Dil Bölümleri',
      'Henüz karar vermedim',
    ]),
    required: true,
  },
  {
    order: 3,
    type: 'likert',
    text: 'Hedef bölümünüze girmek için gereken net sayısına şu an ne kadar yakınsınız?',
    options: JSON.stringify([
      '1 - Çok uzaktayım, büyük bir açık var',
      '2',
      '3 - Orta düzeyde, çalışmaya devam ediyorum',
      '4',
      '5 - Hedef netimi yakalıyorum veya geçiyorum',
    ]),
    required: true,
  },
  {
    order: 4,
    type: 'multiple_choice',
    text: 'Aileniz meslek seçiminizde nasıl bir tutum sergiliyor?',
    options: JSON.stringify([
      'Kendi seçimime tamamen saygı duyuyorlar',
      'Belirli meslekleri (doktor, mühendis vb.) tercih ediyorlar ama baskı yapmıyorlar',
      'Güçlü bir baskı var, kendi istediğim mesleği seçemiyorum',
      'Maddi kaygılarla yönlendiriyorlar (güvenceli iş, yüksek maaş)',
      'Henüz bu konuyu konuşmadık',
    ]),
    required: true,
  },
  {
    order: 5,
    type: 'multiple_choice',
    text: 'Hedeflediğiniz mesleğin günlük iş hayatı hakkında ne kadar bilgi sahibisiniz?',
    options: JSON.stringify([
      'O alanda çalışan biriyle bizzat konuştum, gerçekçi bir fikrim var',
      'İnternetten araştırdım, genel bir fikrim var',
      'Sadece dizi/film/sosyal medyadan izledim',
      'Çok az bilgim var, tam olarak ne yapıldığını bilmiyorum',
    ]),
    required: true,
  },
  {
    order: 6,
    type: 'multiple_choice',
    text: 'Üniversite eğitiminizi finanse etmek için hangi seçenekleri düşünüyorsunuz? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify([
      'Aile desteği',
      'KYK bursu / devlet bursu',
      'Özel burs (vakıf, kurum)',
      'Yarı zamanlı çalışma',
      'Yurt dışı burs imkânları',
      'Henüz düşünmedim',
    ]),
    required: true,
  },
  {
    order: 7,
    type: 'multiple_choice',
    text: 'Hedef mesleğinizde Türkiye\'deki ortalama başlangıç maaşı hakkında ne düşünüyorsunuz?',
    options: JSON.stringify([
      'Araştırdım, gerçekçi bir beklentim var',
      'Yaklaşık bir fikrim var ama kesin rakam bilmiyorum',
      'Maaş benim için şu an öncelikli değil, işi sevmek daha önemli',
      'Hiç araştırmadım',
    ]),
    required: true,
  },
  {
    order: 8,
    type: 'multiple_choice',
    text: 'Yapay zeka ve teknoloji, hedef mesleğinizi nasıl etkileyecek?',
    options: JSON.stringify([
      'Hedef mesleğim yapay zekadan güçlü biçimde etkilenecek, bunu göz önünde bulunduruyorum',
      'Kısmen etkilenecek ama insan faktörü hâlâ kritik',
      'Hedef mesleğim yapay zekadan çok az etkilenecek',
      'Bu konuyu henüz düşünmedim',
    ]),
    required: true,
  },
  {
    order: 9,
    type: 'multiple_choice',
    text: 'Hedef bölümünüze giremezseniz alternatif planınız nedir?',
    options: JSON.stringify([
      'Benzer bir bölümü tercih ederim (2. tercih hazır)',
      'Bir yıl daha hazırlanıp tekrar denerim',
      'Yurt dışında okumayı düşünürüm',
      'Meslek yüksekokulu veya önlisans seçeneğini değerlendiririm',
      'Henüz alternatif planım yok',
    ]),
    required: true,
  },
  {
    order: 10,
    type: 'text',
    text: 'Önümüzdeki 6 ay içinde meslek hedefinize ulaşmak için atacağınız 3 somut adımı yazın. (Örnek: "Haftada 3 gün TYT matematik çalışacağım", "Bir doktorla gölge gün geçireceğim")',
    options: null,
    required: true,
  },
  {
    order: 11,
    type: 'multiple_choice',
    text: 'Lise hayatınızda sizi en çok hangi ders veya etkinlik heyecanlandırdı?',
    options: JSON.stringify([
      'Matematik / Fizik / Kimya / Biyoloji',
      'Edebiyat / Tarih / Felsefe / Sosyal Bilimler',
      'Sanat / Müzik / Tiyatro / Tasarım',
      'Teknoloji / Bilgisayar / Kodlama',
      'Spor / Liderlik / Kulüp faaliyetleri',
      'Yabancı Dil',
    ]),
    required: true,
  },
  {
    order: 12,
    type: 'text',
    text: 'Bu değerlendirme sürecinde kendiniz hakkında fark ettiğiniz en önemli şey nedir? Kariyer planınızı nasıl şekillendiriyor?',
    options: null,
    required: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 18-21 YAŞ GRUBU — Etap 3: Kariyer Stratejisi ve Eylem Planı (stageId: 60006)
// Odak: Üniversite öğrencisi / yeni mezun, staj, ilk iş, CV, mülakat,
//        bölüm memnuniyeti, yüksek lisans kararı
// ─────────────────────────────────────────────────────────────────────────────
const questions1821 = [
  {
    order: 1,
    type: 'text',
    text: 'Hedef pozisyonunuz ve çalışmak istediğiniz sektör/şirket nedir? Bu seçimin arkasındaki en güçlü motivasyonunuzu açıklayın.',
    options: null,
    required: true,
  },
  {
    order: 2,
    type: 'multiple_choice',
    text: 'Okuduğunuz bölümden memnun musunuz? Kariyer hedeflerinizle ne kadar örtüşüyor?',
    options: JSON.stringify([
      'Çok memnunum, kariyer hedeflerimle tam örtüşüyor',
      'Genel olarak memnunum, bazı eksikler var',
      'Kararsızım, bölümü sevsem de kariyer yolumu tam bilmiyorum',
      'Memnun değilim, yanlış bölüm seçtim ama devam ediyorum',
      'Bölüm değiştirmeyi veya çift anadal yapmayı düşünüyorum',
    ]),
    required: true,
  },
  {
    order: 3,
    type: 'multiple_choice',
    text: 'Staj veya iş deneyiminiz ne durumda?',
    options: JSON.stringify([
      'Birden fazla staj yaptım, sektörü tanıyorum',
      'Bir staj yaptım, deneyimim sınırlı',
      'Henüz staj yapmadım ama planlıyorum',
      'Staj bulamadım / fırsat olmadı',
      'Yarı zamanlı veya tam zamanlı çalışıyorum',
    ]),
    required: true,
  },
  {
    order: 4,
    type: 'likert',
    text: 'CV\'niz ve LinkedIn profiliniz ne kadar hazır?',
    options: JSON.stringify([
      '1 - Hiç hazırlamadım',
      '2',
      '3 - Temel düzeyde var, ama güçlendirmem gerekiyor',
      '4',
      '5 - Profesyonel düzeyde hazır, düzenli güncelliyorum',
    ]),
    required: true,
  },
  {
    order: 5,
    type: 'multiple_choice',
    text: 'İş görüşmesi (mülakat) deneyiminiz nasıl?',
    options: JSON.stringify([
      'Birden fazla mülakate girdim, kendime güveniyorum',
      'Bir iki mülakat deneyimim var',
      'Hiç mülakate girmedim ama hazırlanıyorum',
      'Mülakat konusunda çok endişeliyim',
    ]),
    required: true,
  },
  {
    order: 6,
    type: 'multiple_choice',
    text: 'Kariyer gelişiminiz için hangi adımları attınız? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify([
      'Online sertifika aldım (Coursera, Udemy vb.)',
      'Hackathon / yarışmaya katıldım',
      'Kişisel proje veya portföy oluşturdum',
      'Sektör etkinliklerine / konferanslara katıldım',
      'Mentorluk aldım',
      'Akademik yayın / araştırmaya katkı sağladım',
      'Henüz somut bir adım atmadım',
    ]),
    required: true,
  },
  {
    order: 7,
    type: 'multiple_choice',
    text: 'Mezuniyet sonrası ilk yıl için temel hedefiniz nedir?',
    options: JSON.stringify([
      'Hedef şirketimde tam zamanlı işe başlamak',
      'Yüksek lisans / doktora yapmak (Türkiye)',
      'Yurt dışında yüksek lisans yapmak',
      'Kendi işimi kurmak / startup başlatmak',
      'Sektörü keşfetmek için birkaç farklı deneyim yaşamak',
      'Henüz karar vermedim',
    ]),
    required: true,
  },
  {
    order: 8,
    type: 'multiple_choice',
    text: 'Kariyer hedefinize ulaşmada en büyük engel nedir?',
    options: JSON.stringify([
      'Yeterli deneyim / staj eksikliği',
      'Teknik beceri eksikliği',
      'Ağ (network) yetersizliği',
      'Finansal kısıtlamalar',
      'Özgüven eksikliği',
      'Sektörde yüksek rekabet',
      'Aile / sosyal baskı',
    ]),
    required: true,
  },
  {
    order: 9,
    type: 'likert',
    text: 'Kişisel markanızı (LinkedIn, portföy, sosyal medya varlığı) ne kadar geliştirdiniz?',
    options: JSON.stringify([
      '1 - Hiç çalışmadım',
      '2',
      '3 - Başlangıç düzeyinde',
      '4',
      '5 - Aktif ve güçlü bir kişisel markam var',
    ]),
    required: true,
  },
  {
    order: 10,
    type: 'multiple_choice',
    text: 'Yapay zeka ve otomasyon, kariyer planlamanızı nasıl etkiliyor?',
    options: JSON.stringify([
      'AI\'ya dayanıklı alanlara yöneliyorum (insan ilişkileri, yaratıcılık, strateji)',
      'AI araçlarını öğrenmeye odaklanıyorum, teknolojiyle birlikte çalışacağım',
      'AI benim sektörümü çok etkilemez diye düşünüyorum',
      'Bu konuyu henüz yeterince düşünmedim',
      'AI beni endişelendiriyor ama ne yapacağımı bilmiyorum',
    ]),
    required: true,
  },
  {
    order: 11,
    type: 'text',
    text: 'Önümüzdeki 6 ay için kariyer hedefinize ulaşmak adına atacağınız 5 somut adımı yazın. (Mümkün olduğunca spesifik olun: "Hangi şirkete başvuracağım?", "Hangi kursu tamamlayacağım?")',
    options: null,
    required: true,
  },
  {
    order: 12,
    type: 'text',
    text: 'Bu değerlendirme sürecinde kendiniz veya kariyer hedefiniz hakkında fark ettiğiniz en önemli içgörü nedir?',
    options: null,
    required: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 22-24 YAŞ GRUBU — Etap 3: Kariyer Optimizasyonu ve Uzun Vadeli Planlama (stageId: 60009)
// Odak: İş hayatına yeni girmiş / 1-2 yıl deneyimli, kariyer geçişi,
//        liderlik, finansal bağımsızlık, girişimcilik, uzun vadeli strateji
// ─────────────────────────────────────────────────────────────────────────────
const questions2224 = [
  {
    order: 1,
    type: 'text',
    text: 'Şu anki kariyer pozisyonunuzu ve 5 yıl içinde olmak istediğiniz yeri tanımlayın. Bu iki nokta arasındaki en kritik fark nedir?',
    options: null,
    required: true,
  },
  {
    order: 2,
    type: 'multiple_choice',
    text: 'Şu anki işinizden / kariyer yolunuzdan ne kadar memnunsunuz?',
    options: JSON.stringify([
      'Çok memnunum, doğru yoldayım',
      'Genel olarak memnunum ama bazı şeyler değişmeli',
      'Kararsızım, kariyer değişikliği düşünüyorum',
      'Memnun değilim, aktif olarak yeni fırsatlar arıyorum',
      'Henüz iş hayatına girmedim, hazırlanıyorum',
    ]),
    required: true,
  },
  {
    order: 3,
    type: 'multiple_choice',
    text: 'Önümüzdeki 5 yılda kariyer gelişiminiz için en kritik yatırım hangisi olacak?',
    options: JSON.stringify([
      'Teknik uzmanlık derinleştirme (sertifika, uzmanlık alanı)',
      'Liderlik ve yönetim becerileri geliştirme',
      'Yüksek lisans / MBA / doktora',
      'Uluslararası deneyim (yurt dışı iş / eğitim)',
      'Girişimcilik / kendi işini kurma',
      'Güçlü bir profesyonel ağ (network) oluşturma',
    ]),
    required: true,
  },
  {
    order: 4,
    type: 'likert',
    text: 'Finansal bağımsızlık ve kariyer güvencesi konusunda kendinizi ne kadar hazır hissediyorsunuz?',
    options: JSON.stringify([
      '1 - Hiç hazır değilim, büyük belirsizlik var',
      '2',
      '3 - Orta düzeyde, temel ihtiyaçlarımı karşılıyorum',
      '4',
      '5 - Finansal olarak güvende hissediyorum, uzun vadeli planlıyorum',
    ]),
    required: true,
  },
  {
    order: 5,
    type: 'multiple_choice',
    text: 'Kariyer yolculuğunuzda yapay zeka dönüşümüne karşı stratejiniz nedir?',
    options: JSON.stringify([
      'AI\'ya dayanıklı alanlara (yaratıcılık, insan ilişkileri, etik) odaklanıyorum',
      'AI araçlarını aktif öğreniyorum, teknolojiyle birlikte çalışacağım',
      'AI\'nın yerine geçemeyeceği uzman bir niş alan oluşturuyorum',
      'Girişimci olarak AI\'ı bir fırsat olarak görüyorum',
      'Bu konuyu henüz yeterince düşünmedim',
    ]),
    required: true,
  },
  {
    order: 6,
    type: 'multiple_choice',
    text: 'Kariyer gelişiminizde hangi stratejileri aktif olarak kullanıyorsunuz? (Birden fazla seçebilirsiniz)',
    options: JSON.stringify([
      'Sektör konferansları ve etkinliklerine katılıyorum',
      'Mentorluk alıyorum veya veriyorum',
      'Profesyonel sertifikalar alıyorum',
      'Düzenli olarak sektör yayınlarını takip ediyorum',
      'LinkedIn\'de aktif içerik üretiyorum',
      'Yan projeler veya freelance çalışmalar yapıyorum',
      'Hiçbirini yapmıyorum',
    ]),
    required: true,
  },
  {
    order: 7,
    type: 'multiple_choice',
    text: 'Liderlik veya yöneticilik pozisyonuna ne zaman geçmeyi hedefliyorsunuz?',
    options: JSON.stringify([
      '1-2 yıl içinde (takım lideri / proje sorumlusu)',
      '3-5 yıl içinde (orta düzey yönetici)',
      '5+ yıl içinde (üst düzey yönetici / direktör)',
      'Liderlik hedefim yok, uzman olarak kalmak istiyorum',
      'Kendi işimi kurmak istiyorum, kurumsal liderlik değil',
    ]),
    required: true,
  },
  {
    order: 8,
    type: 'text',
    text: 'Kariyer yolculuğunuzda sizi en çok zorlayan deneyim neydi? Bu deneyimden ne öğrendiniz ve sizi nasıl şekillendirdi?',
    options: null,
    required: true,
  },
  {
    order: 9,
    type: 'likert',
    text: 'Kariyer hedeflerinize ulaşmak için gereken öz disiplin ve motivasyona ne kadar sahipsiniz?',
    options: JSON.stringify([
      '1 - Çok zorlanıyorum, motivasyon kaybı yaşıyorum',
      '2',
      '3 - Orta düzeyde, iyi ve kötü dönemler oluyor',
      '4',
      '5 - Yüksek motivasyonum var, tutarlı biçimde ilerliyorum',
    ]),
    required: true,
  },
  {
    order: 10,
    type: 'multiple_choice',
    text: '10 yıl sonra kendinizi hangi kariyer aşamasında görüyorsunuz?',
    options: JSON.stringify([
      'Kendi şirketimin kurucusu / CEO\'su',
      'Büyük bir şirketin üst düzey yöneticisi (C-suite)',
      'Alanında tanınan bir uzman / düşünce lideri',
      'Uluslararası arenada çalışan bir profesyonel',
      'Sosyal etki yaratan bir lider (STK, kamu, eğitim)',
      'Finansal bağımsızlığa ulaşmış, seçimlerime göre çalışan biri',
    ]),
    required: true,
  },
  {
    order: 11,
    type: 'text',
    text: 'Önümüzdeki 12 ay için kariyer hedefinize ulaşmak adına atacağınız 5 somut ve ölçülebilir adımı yazın. Her adım için bir hedef tarih belirleyin.',
    options: null,
    required: true,
  },
  {
    order: 12,
    type: 'text',
    text: 'Bu değerlendirme sürecinin tamamında kendiniz hakkında fark ettiğiniz en önemli içgörü nedir? Bu farkındalık kariyer stratejinizi nasıl değiştirecek?',
    options: null,
    required: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Veritabanına Uygula
// ─────────────────────────────────────────────────────────────────────────────

const stages = [
  { id: 60003, questions: questions1417, label: '14-17 yaş' },
  { id: 60006, questions: questions1821, label: '18-21 yaş' },
  { id: 60009, questions: questions2224, label: '22-24 yaş' },
];

let totalDeleted = 0;
let totalInserted = 0;

for (const stage of stages) {
  // Mevcut soruları sil
  const [del] = await conn.query('DELETE FROM questions WHERE stageId = ?', [stage.id]);
  totalDeleted += del.affectedRows;
  console.log(`[${stage.label}] ${del.affectedRows} eski soru silindi (stageId: ${stage.id})`);

  // Yeni soruları ekle
  for (const q of stage.questions) {
    await conn.query(
      'INSERT INTO questions (stageId, `order`, type, text, options, required) VALUES (?, ?, ?, ?, ?, ?)',
      [stage.id, q.order, q.type, q.text, q.options, q.required ? 1 : 0]
    );
    totalInserted++;
  }
  console.log(`[${stage.label}] ${stage.questions.length} yeni soru eklendi`);
}

console.log(`\n✅ Tamamlandı: ${totalDeleted} soru silindi, ${totalInserted} soru eklendi.`);
await conn.end();
