/**
 * Kariyer Değerleri Envanteri - Seed Script
 * reflektif-web projesindeki üçüncü test olan "Kariyer Değerleri Envanteri"ni
 * meslegim.tr'nin mevcut etap yapısına entegre eder.
 * 
 * Her yaş grubu (14-17, 18-21, 22-24) için Etap 4 olarak eklenir.
 * 30 soru, likert tipi (1-5 ölçeği), 10 değer boyutu.
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// ============================================================
// 10 Kariyer Değeri Boyutu
// ============================================================
// 1. Ekonomik Güvence (Maaş, Finansal Güvence)
// 2. İş-Yaşam Dengesi
// 3. Kişisel Gelişim ve Öğrenme
// 4. Sosyal Etki ve Topluma Katkı
// 5. Yaratıcılık ve İnovasyon
// 6. Liderlik ve Yönetim
// 7. Bağımsızlık ve Özerklik
// 8. Prestij ve Statü
// 9. İş Güvencesi ve Stabilite
// 10. Takım Çalışması ve İşbirliği
// ============================================================

const likertOptions = JSON.stringify(["1", "2", "3", "4", "5"]);

// Yaş grubuna göre uyarlanmış sorular
const questionsPerAgeGroup = {
  "14-17": [
    // Ekonomik Güvence (3 soru)
    { text: "İleride iyi para kazanmak benim için çok önemli.", category: "ekonomik_guvence", order: 1 },
    { text: "Meslek seçerken maaşın yüksek olması en önemli kriterlerden biridir.", category: "ekonomik_guvence", order: 2 },
    { text: "Ailemi maddi olarak destekleyebilecek bir iş istiyorum.", category: "ekonomik_guvence", order: 3 },
    // İş-Yaşam Dengesi (3 soru)
    { text: "Hobilerimi ve arkadaşlarımla vakit geçirmeyi işimden daha çok önemsiyorum.", category: "is_yasam_dengesi", order: 4 },
    { text: "Çok çalışmak yerine dengeli bir yaşam sürmek istiyorum.", category: "is_yasam_dengesi", order: 5 },
    { text: "Hafta sonları ve tatillerde kesinlikle çalışmak istemem.", category: "is_yasam_dengesi", order: 6 },
    // Kişisel Gelişim (3 soru)
    { text: "Sürekli yeni şeyler öğrenmek beni mutlu eder.", category: "kisisel_gelisim", order: 7 },
    { text: "Kendimi geliştirmek için kurslara ve eğitimlere katılmak isterim.", category: "kisisel_gelisim", order: 8 },
    { text: "Bir meslek seçerken ne kadar gelişim fırsatı sunduğuna bakarım.", category: "kisisel_gelisim", order: 9 },
    // Sosyal Etki (3 soru)
    { text: "İnsanlara yardım etmek benim için çok tatmin edici.", category: "sosyal_etki", order: 10 },
    { text: "Topluma faydalı bir iş yapmak istiyorum.", category: "sosyal_etki", order: 11 },
    { text: "Çevreye ve doğaya duyarlı bir meslek tercih ederim.", category: "sosyal_etki", order: 12 },
    // Yaratıcılık (3 soru)
    { text: "Yeni fikirler üretmek ve yaratıcı projeler yapmak beni heyecanlandırır.", category: "yaraticilik", order: 13 },
    { text: "Rutin ve tekrarlayan işlerden sıkılırım.", category: "yaraticilik", order: 14 },
    { text: "Sanatsal veya tasarım odaklı bir meslek ilgimi çeker.", category: "yaraticilik", order: 15 },
    // Liderlik (3 soru)
    { text: "Bir grubun başında olmak ve yönlendirmek hoşuma gider.", category: "liderlik", order: 16 },
    { text: "Kararları ben almak istiyorum, başkalarının kararlarına uymak zor geliyor.", category: "liderlik", order: 17 },
    { text: "İleride kendi ekibimi yönetmek istiyorum.", category: "liderlik", order: 18 },
    // Bağımsızlık (3 soru)
    { text: "Kendi başıma çalışmayı tercih ederim.", category: "bagimsizlik", order: 19 },
    { text: "Esnek çalışma saatleri benim için çok önemli.", category: "bagimsizlik", order: 20 },
    { text: "İleride kendi işimi kurmak istiyorum.", category: "bagimsizlik", order: 21 },
    // Prestij (3 soru)
    { text: "Saygın ve prestijli bir meslek sahibi olmak istiyorum.", category: "prestij", order: 22 },
    { text: "İnsanların mesleğime hayranlık duyması benim için önemli.", category: "prestij", order: 23 },
    { text: "Toplumda tanınan bir pozisyonda olmak istiyorum.", category: "prestij", order: 24 },
    // İş Güvencesi (3 soru)
    { text: "İşten çıkarılma korkusu yaşamak istemem.", category: "is_guvencesi", order: 25 },
    { text: "Devlet memurluğu gibi güvenceli bir iş tercih ederim.", category: "is_guvencesi", order: 26 },
    { text: "Düzenli ve öngörülebilir bir gelir benim için çok önemli.", category: "is_guvencesi", order: 27 },
    // Takım Çalışması (3 soru)
    { text: "Ekip arkadaşlarımla birlikte çalışmak beni motive eder.", category: "takim_calismasi", order: 28 },
    { text: "İş yerinde sosyal ilişkiler kurmak benim için önemli.", category: "takim_calismasi", order: 29 },
    { text: "Ortak bir hedefe doğru birlikte çalışmak beni mutlu eder.", category: "takim_calismasi", order: 30 },
  ],
  "18-21": [
    // Ekonomik Güvence (3 soru)
    { text: "Kariyer planımda maaş ve yan haklar en belirleyici faktörlerden biridir.", category: "ekonomik_guvence", order: 1 },
    { text: "Finansal bağımsızlığımı en kısa sürede kazanmak istiyorum.", category: "ekonomik_guvence", order: 2 },
    { text: "Yatırım yapabilecek ve birikim sağlayabilecek bir gelir düzeyi hedefliyorum.", category: "ekonomik_guvence", order: 3 },
    // İş-Yaşam Dengesi (3 soru)
    { text: "İş dışında kalan zamanımı kişisel ilgi alanlarıma ayırmak istiyorum.", category: "is_yasam_dengesi", order: 4 },
    { text: "Uzun çalışma saatleri gerektiren bir iş beni mutsuz eder.", category: "is_yasam_dengesi", order: 5 },
    { text: "Uzaktan veya hibrit çalışma modeli benim için önemli bir kriter.", category: "is_yasam_dengesi", order: 6 },
    // Kişisel Gelişim (3 soru)
    { text: "Kariyerimde sürekli öğrenme ve gelişim fırsatları arıyorum.", category: "kisisel_gelisim", order: 7 },
    { text: "Yurt dışı deneyimi veya uluslararası projeler beni motive eder.", category: "kisisel_gelisim", order: 8 },
    { text: "Sertifika programları ve ileri eğitim imkanları sunan şirketleri tercih ederim.", category: "kisisel_gelisim", order: 9 },
    // Sosyal Etki (3 soru)
    { text: "Toplumsal sorunlara çözüm üreten bir kariyer yolu çizmek istiyorum.", category: "sosyal_etki", order: 10 },
    { text: "Sosyal sorumluluk projeleri olan şirketlerde çalışmayı tercih ederim.", category: "sosyal_etki", order: 11 },
    { text: "İşimin dünyayı daha iyi bir yer yapmasına katkıda bulunmasını istiyorum.", category: "sosyal_etki", order: 12 },
    // Yaratıcılık (3 soru)
    { text: "Yenilikçi ve yaratıcı çözümler üretebileceğim bir ortamda çalışmak istiyorum.", category: "yaraticilik", order: 13 },
    { text: "Standart prosedürleri takip etmek yerine kendi yöntemlerimi geliştirmeyi tercih ederim.", category: "yaraticilik", order: 14 },
    { text: "Ar-Ge veya inovasyon odaklı bir departmanda çalışmak beni heyecanlandırır.", category: "yaraticilik", order: 15 },
    // Liderlik (3 soru)
    { text: "Proje yönetimi ve ekip liderliği görevleri beni motive eder.", category: "liderlik", order: 16 },
    { text: "Stratejik kararlar almak ve vizyoner olmak istiyorum.", category: "liderlik", order: 17 },
    { text: "5 yıl içinde yönetici pozisyonuna yükselmek hedeflerim arasında.", category: "liderlik", order: 18 },
    // Bağımsızlık (3 soru)
    { text: "Kendi çalışma yöntemlerimi belirleyebileceğim bir iş ortamı istiyorum.", category: "bagimsizlik", order: 19 },
    { text: "Mikro yönetim altında çalışmak beni rahatsız eder.", category: "bagimsizlik", order: 20 },
    { text: "Freelance veya girişimcilik yolunu ciddi olarak düşünüyorum.", category: "bagimsizlik", order: 21 },
    // Prestij (3 soru)
    { text: "Sektörde tanınan ve saygı duyulan bir profesyonel olmak istiyorum.", category: "prestij", order: 22 },
    { text: "Çalıştığım şirketin marka değeri ve itibarı benim için önemli.", category: "prestij", order: 23 },
    { text: "Profesyonel ağımı genişletmek ve sektörde görünür olmak istiyorum.", category: "prestij", order: 24 },
    // İş Güvencesi (3 soru)
    { text: "Ekonomik kriz dönemlerinde bile işimi kaybetmeme garantisi istiyorum.", category: "is_guvencesi", order: 25 },
    { text: "Uzun vadeli kariyer planlaması yapabileceğim stabil bir iş arıyorum.", category: "is_guvencesi", order: 26 },
    { text: "Emeklilik planı ve sağlık sigortası gibi sosyal haklar benim için kritik.", category: "is_guvencesi", order: 27 },
    // Takım Çalışması (3 soru)
    { text: "Farklı disiplinlerden insanlarla birlikte çalışmak beni zenginleştirir.", category: "takim_calismasi", order: 28 },
    { text: "İş yerinde güçlü bir takım ruhu ve dayanışma ortamı arıyorum.", category: "takim_calismasi", order: 29 },
    { text: "Mentorluk ve bilgi paylaşımı kültürü olan şirketleri tercih ederim.", category: "takim_calismasi", order: 30 },
  ],
  "22-24": [
    // Ekonomik Güvence (3 soru)
    { text: "Mevcut gelir düzeyimi artırmak kariyer değişikliğimin ana motivasyonlarından biri.", category: "ekonomik_guvence", order: 1 },
    { text: "Performansa dayalı prim ve bonus sistemi benim için önemli bir motivasyon kaynağı.", category: "ekonomik_guvence", order: 2 },
    { text: "Finansal hedeflerime ulaşmak için kariyer stratejimi buna göre şekillendiriyorum.", category: "ekonomik_guvence", order: 3 },
    // İş-Yaşam Dengesi (3 soru)
    { text: "İş-yaşam dengesini korumak için gerekirse daha düşük maaşı kabul ederim.", category: "is_yasam_dengesi", order: 4 },
    { text: "Esnek çalışma politikaları olan şirketleri aktif olarak araştırıyorum.", category: "is_yasam_dengesi", order: 5 },
    { text: "Tükenmişlik (burnout) yaşamamak için sınırlarımı net çiziyorum.", category: "is_yasam_dengesi", order: 6 },
    // Kişisel Gelişim (3 soru)
    { text: "Uzmanlık alanımda derinleşmek ve thought leader olmak istiyorum.", category: "kisisel_gelisim", order: 7 },
    { text: "MBA veya yüksek lisans gibi ileri eğitim programlarını kariyer planıma dahil ediyorum.", category: "kisisel_gelisim", order: 8 },
    { text: "Konferanslara katılmak ve sektörel yayınlar takip etmek benim için rutin.", category: "kisisel_gelisim", order: 9 },
    // Sosyal Etki (3 soru)
    { text: "Kariyerimin toplumsal bir amaca hizmet etmesi benim için vazgeçilmez.", category: "sosyal_etki", order: 10 },
    { text: "Sürdürülebilirlik ve etik değerlere önem veren organizasyonlarda çalışmak istiyorum.", category: "sosyal_etki", order: 11 },
    { text: "Gönüllülük ve sosyal girişimcilik projeleri kariyer tatminimi artırıyor.", category: "sosyal_etki", order: 12 },
    // Yaratıcılık (3 soru)
    { text: "Mevcut iş süreçlerini iyileştirmek ve yenilikçi çözümler geliştirmek beni motive eder.", category: "yaraticilik", order: 13 },
    { text: "Deneysel projeler ve prototip geliştirme süreçlerinde yer almak istiyorum.", category: "yaraticilik", order: 14 },
    { text: "Yaratıcılığımı kullanabileceğim bir iş ortamı, maaştan daha önemli olabilir.", category: "yaraticilik", order: 15 },
    // Liderlik (3 soru)
    { text: "Organizasyonel değişim süreçlerinde aktif rol almak ve yön vermek istiyorum.", category: "liderlik", order: 16 },
    { text: "Kendi ekibimi kurma ve yetiştirme vizyonum var.", category: "liderlik", order: 17 },
    { text: "C-level (üst düzey yönetici) pozisyonuna ulaşmak uzun vadeli hedeflerim arasında.", category: "liderlik", order: 18 },
    // Bağımsızlık (3 soru)
    { text: "Kendi iş modelimi oluşturmak ve bağımsız çalışmak en büyük kariyer hayalim.", category: "bagimsizlik", order: 19 },
    { text: "Kurumsal yapıların katı hiyerarşisi beni kısıtlıyor.", category: "bagimsizlik", order: 20 },
    { text: "Portföy kariyeri (birden fazla gelir kaynağı) modeli beni çekiyor.", category: "bagimsizlik", order: 21 },
    // Prestij (3 soru)
    { text: "Sektörümde referans noktası olarak görülmek istiyorum.", category: "prestij", order: 22 },
    { text: "Profesyonel itibarım ve kişisel markam kariyer kararlarımı etkiliyor.", category: "prestij", order: 23 },
    { text: "Uluslararası arenada tanınmak ve global projelerde yer almak istiyorum.", category: "prestij", order: 24 },
    // İş Güvencesi (3 soru)
    { text: "Sektörümün geleceği ve yapay zeka etkisi konusunda endişelerim var.", category: "is_guvencesi", order: 25 },
    { text: "Transferable (aktarılabilir) beceriler geliştirerek iş güvencemi artırmak istiyorum.", category: "is_guvencesi", order: 26 },
    { text: "Kriz dönemlerinde ayakta kalabilecek sektörleri tercih ediyorum.", category: "is_guvencesi", order: 27 },
    // Takım Çalışması (3 soru)
    { text: "Cross-functional (çapraz fonksiyonel) ekiplerle çalışmak perspektifimi genişletiyor.", category: "takim_calismasi", order: 28 },
    { text: "İş yerinde güçlü bir mentorluk ve koçluk kültürü arıyorum.", category: "takim_calismasi", order: 29 },
    { text: "Takım başarısı bireysel başarıdan daha değerli.", category: "takim_calismasi", order: 30 },
  ],
};

// Stage descriptions per age group
const stageDescriptions = {
  "14-17": "Kariyerinizde sizin için neyin önemli olduğunu keşfedin. Maaş, iş-yaşam dengesi, yaratıcılık, liderlik gibi 10 farklı kariyer değeri boyutunda kendinizi değerlendirin.",
  "18-21": "Kariyer değerlerinizi belirleyin ve profesyonel yaşamınızda neye öncelik verdiğinizi anlayın. Bu envanter, iş arama ve kariyer planlama sürecinize rehberlik edecektir.",
  "22-24": "Kariyer değerlerinizi derinlemesine analiz edin. Mevcut kariyerinizle uyumunuzu değerlendirin ve gelecek kariyer kararlarınız için stratejik bir yol haritası oluşturun.",
};

async function seed() {
  console.log('🌱 Kariyer Değerleri Envanteri seed başlatılıyor...\n');

  for (const ageGroup of ["14-17", "18-21", "22-24"]) {
    console.log(`📋 ${ageGroup} yaş grubu için Etap 4 ekleniyor...`);

    // Check if stage already exists
    const [existingStages] = await conn.execute(
      `SELECT id FROM stages WHERE ageGroup = ? AND \`order\` = 4`,
      [ageGroup]
    );

    if (existingStages.length > 0) {
      console.log(`  ⚠️  ${ageGroup} yaş grubu için Etap 4 zaten mevcut (ID: ${existingStages[0].id}), atlanıyor.`);
      continue;
    }

    // Insert new stage
    const [stageResult] = await conn.execute(
      `INSERT INTO stages (name, description, ageGroup, \`order\`, createdAt, updatedAt) VALUES (?, ?, ?, 4, NOW(), NOW())`,
      [
        `Etap 4: Kariyer Değerleri Envanteri`,
        stageDescriptions[ageGroup],
        ageGroup,
      ]
    );

    const stageId = stageResult.insertId;
    console.log(`  ✅ Stage oluşturuldu: ID=${stageId}`);

    // Insert questions for this age group
    const questions = questionsPerAgeGroup[ageGroup];
    for (const q of questions) {
      await conn.execute(
        `INSERT INTO questions (stageId, text, type, options, category, metadata, required, \`order\`, createdAt, updatedAt) VALUES (?, ?, 'likert', ?, ?, ?, 1, ?, NOW(), NOW())`,
        [
          stageId,
          q.text,
          likertOptions,
          q.category,
          JSON.stringify({ dimension: q.category, scale: "1-5", labels: { "1": "Kesinlikle Katılmıyorum", "2": "Katılmıyorum", "3": "Kararsızım", "4": "Katılıyorum", "5": "Kesinlikle Katılıyorum" } }),
          q.order,
        ]
      );
    }
    console.log(`  ✅ ${questions.length} soru eklendi.`);
  }

  // Also create user_stages entries for existing active students
  console.log('\n📋 Mevcut aktif öğrenciler için Etap 4 user_stages kayıtları oluşturuluyor...');
  
  const [activeStudents] = await conn.execute(
    `SELECT u.id, u.ageGroup FROM users u WHERE u.role = 'student' AND u.status = 'active' AND u.ageGroup IS NOT NULL`
  );

  for (const student of activeStudents) {
    // Get the new stage 4 for this student's age group
    const [stage4] = await conn.execute(
      `SELECT id FROM stages WHERE ageGroup = ? AND \`order\` = 4`,
      [student.ageGroup]
    );

    if (stage4.length === 0) continue;

    // Check if user_stage already exists
    const [existing] = await conn.execute(
      `SELECT id FROM user_stages WHERE userId = ? AND stageId = ?`,
      [student.id, stage4[0].id]
    );

    if (existing.length === 0) {
      await conn.execute(
        `INSERT INTO user_stages (userId, stageId, status, createdAt, updatedAt) VALUES (?, ?, 'locked', NOW(), NOW())`,
        [student.id, stage4[0].id]
      );
      console.log(`  ✅ Öğrenci ${student.id} için Etap 4 (locked) oluşturuldu.`);
    }
  }

  console.log('\n🎉 Kariyer Değerleri Envanteri seed tamamlandı!');
  await conn.end();
}

seed().catch(err => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
