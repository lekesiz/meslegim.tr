/**
 * Kariyer Risk Analizi Soru Bankası Seed Script
 * 3 yaş grubu x 10 soru = 30 soru
 * Her soru 3 seçenekli multiple_choice (risk-taker/balanced/cautious)
 * 5 boyut x 2 soru = 10 soru per yaş grubu
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

// Yaş gruplarına göre stage tanımları
const AGE_GROUPS = [
  { ageGroup: '14-17', stageOrder: 5, stageName: 'Etap 5: Kariyer Risk Analizi' },
  { ageGroup: '18-21', stageOrder: 5, stageName: 'Etap 5: Kariyer Risk Analizi' },
  { ageGroup: '22-24', stageOrder: 5, stageName: 'Etap 5: Kariyer Risk Analizi' },
];

// Ortak soru şablonları - yaş grubuna göre uyarlanacak
const QUESTION_TEMPLATES = {
  '14-17': [
    // Değişim Toleransı (2 soru)
    {
      text: 'Okulunda sınıf değişikliği yapılacağı söylense ne hissedersin?',
      category: 'changeTolerance',
      options: JSON.stringify([
        'Harika! Yeni arkadaşlar edinmek heyecan verici',
        'Biraz endişelenirim ama alışırım',
        'Çok üzülürüm, mevcut arkadaşlarımdan ayrılmak istemem'
      ]),
    },
    {
      text: 'Ailenin başka bir şehre taşınması gerekse bu duruma nasıl yaklaşırsın?',
      category: 'changeTolerance',
      options: JSON.stringify([
        'Yeni bir macera! Keşfetmeyi sabırsızlıkla beklerim',
        'Zor olur ama yeni yere alışmaya çalışırım',
        'Çok zor olur, eski yerimde kalmayı tercih ederim'
      ]),
    },
    // Belirsizlik Yönetimi (2 soru)
    {
      text: 'Bir sınav için yeterince çalışıp çalışmadığından emin değilsin. Ne yaparsın?',
      category: 'uncertaintyMgmt',
      options: JSON.stringify([
        'Kendime güvenirim, ne olursa olsun girerim',
        'Son bir tekrar yapar, elimden gelenin en iyisini yaparım',
        'Çok stres olurum, keşke daha fazla zamanım olsaydı derim'
      ]),
    },
    {
      text: 'Gelecekte hangi mesleği yapacağını bilmemek seni nasıl etkiliyor?',
      category: 'uncertaintyMgmt',
      options: JSON.stringify([
        'Hiç endişelenmiyorum, zamanla netleşir',
        'Bazen düşünürüm ama çok da kaygılanmam',
        'Bu belirsizlik beni çok rahatsız ediyor'
      ]),
    },
    // Girişimcilik Eğilimi (2 soru)
    {
      text: 'Okulda bir kulüp veya proje başlatma fırsatın olsa ne yaparsın?',
      category: 'entrepreneurial',
      options: JSON.stringify([
        'Hemen başlatırım! Liderlik yapmayı severim',
        'İlginç bir fikir olursa düşünürüm',
        'Başkasının başlattığı bir projeye katılmayı tercih ederim'
      ]),
    },
    {
      text: 'Harçlığını artırmak için bir fikrin var. Ne yaparsın?',
      category: 'entrepreneurial',
      options: JSON.stringify([
        'Hemen harekete geçer, planımı uygularım',
        'Önce araştırır, uygun olursa denerim',
        'Riskli bulur, ailemden istemeyi tercih ederim'
      ]),
    },
    // Kariyer Esnekliği (2 soru)
    {
      text: 'İlgi alanların sürekli değişiyor. Bu konuda ne düşünüyorsun?',
      category: 'careerFlexibility',
      options: JSON.stringify([
        'Çok normal, her şeyi denemek istiyorum',
        'Bazen kararsız kalıyorum ama bu da bir süreç',
        'Keşke tek bir şeye odaklanabilsem'
      ]),
    },
    {
      text: 'Hayalindeki meslek yerine tamamen farklı bir alan önerilse ne yaparsın?',
      category: 'careerFlexibility',
      options: JSON.stringify([
        'Neden olmasın? Yeni alanları keşfetmek güzel',
        'Önce araştırır, mantıklıysa değerlendiririm',
        'Hayalimdeki meslekten vazgeçmem'
      ]),
    },
    // Karar Alma Tarzı (2 soru)
    {
      text: 'Arkadaşların seni bir etkinliğe davet etti ama detayları bilmiyorsun. Ne yaparsın?',
      category: 'decisionStyle',
      options: JSON.stringify([
        'Hemen kabul ederim, sürprizleri severim',
        'Biraz bilgi alır, sonra karar veririm',
        'Tüm detayları öğrenmeden gitmem'
      ]),
    },
    {
      text: 'İki farklı lise/bölüm arasında seçim yapman gerekiyor. Nasıl karar verirsin?',
      category: 'decisionStyle',
      options: JSON.stringify([
        'İçgüdülerime güvenir, hızlıca karar veririm',
        'Her ikisinin artı ve eksilerini listelerim',
        'Aileme, öğretmenlerime danışır, uzun süre düşünürüm'
      ]),
    },
  ],
  '18-21': [
    // Değişim Toleransı (2 soru)
    {
      text: 'Üniversitede bölüm değiştirme fırsatın olsa ne yaparsın?',
      category: 'changeTolerance',
      options: JSON.stringify([
        'İlgi alanıma daha uygunsa hemen değiştiririm',
        'Artı ve eksilerini değerlendirir, danışırım',
        'Başladığım bölümde devam etmeyi tercih ederim'
      ]),
    },
    {
      text: 'Staj için yurt dışına gitme fırsatın çıksa nasıl tepki verirsin?',
      category: 'changeTolerance',
      options: JSON.stringify([
        'Harika bir fırsat! Hemen başvururum',
        'Koşulları araştırır, uygunsa giderim',
        'Türkiye\'de staj yapmayı tercih ederim'
      ]),
    },
    // Belirsizlik Yönetimi (2 soru)
    {
      text: 'Mezuniyet sonrası ne yapacağın konusunda belirsizlik yaşıyorsun. Bu seni nasıl etkiliyor?',
      category: 'uncertaintyMgmt',
      options: JSON.stringify([
        'Belirsizlik beni heyecanlandırıyor, her şey olabilir',
        'Biraz stresli ama planlar yaparak yönetiyorum',
        'Bu belirsizlik beni çok kaygılandırıyor'
      ]),
    },
    {
      text: 'Bir iş başvurusunun sonucunu bekliyorsun ama haber yok. Ne yaparsın?',
      category: 'uncertaintyMgmt',
      options: JSON.stringify([
        'Diğer fırsatlara da bakarım, tek seçeneğe bağlanmam',
        'Bir süre bekler, sonra takip ederim',
        'Sürekli kontrol eder, çok endişelenirim'
      ]),
    },
    // Girişimcilik Eğilimi (2 soru)
    {
      text: 'Üniversitede bir sosyal girişim veya startup fikrin var. Ne yaparsın?',
      category: 'entrepreneurial',
      options: JSON.stringify([
        'Hemen ekip kurar, hayata geçirmeye çalışırım',
        'Önce iş planı hazırlar, mentorlardan görüş alırım',
        'Fikir güzel ama önce mezun olup deneyim kazanmalıyım'
      ]),
    },
    {
      text: 'Freelance çalışma mı yoksa kurumsal bir işte çalışma mı seni daha çok çeker?',
      category: 'entrepreneurial',
      options: JSON.stringify([
        'Freelance! Kendi patronum olmak istiyorum',
        'İkisi de cazip, duruma göre değişir',
        'Kurumsal iş, düzenli gelir ve güvence önemli'
      ]),
    },
    // Kariyer Esnekliği (2 soru)
    {
      text: 'Okuduğun bölümle ilgisi olmayan bir alanda iş teklifi alsan ne yaparsın?',
      category: 'careerFlexibility',
      options: JSON.stringify([
        'İlginç bir deneyim olur, değerlendiririm',
        'Kariyer hedeflerime uyuyorsa düşünürüm',
        'Kendi alanımda iş bulmayı tercih ederim'
      ]),
    },
    {
      text: 'Yapay zeka nedeniyle mesleklerin değişeceği söyleniyor. Bu seni nasıl etkiliyor?',
      category: 'careerFlexibility',
      options: JSON.stringify([
        'Heyecan verici! Yeni fırsatlar doğacak',
        'Kendimi geliştirmem gerektiğini biliyorum',
        'Endişeleniyorum, güvenli bir alan seçmeliyim'
      ]),
    },
    // Karar Alma Tarzı (2 soru)
    {
      text: 'İki farklı staj teklifi aldın. Biri prestijli ama ücretsiz, diğeri küçük ama ücretli. Ne yaparsın?',
      category: 'decisionStyle',
      options: JSON.stringify([
        'Prestijli olanı seçerim, uzun vadede karşılığını alırım',
        'Her ikisinin artı-eksilerini detaylıca karşılaştırırım',
        'Ücretli olanı seçerim, maddi güvence önemli'
      ]),
    },
    {
      text: 'Önemli bir kariyer kararı alman gerekiyor. Nasıl bir süreç izlersin?',
      category: 'decisionStyle',
      options: JSON.stringify([
        'İçgüdülerime güvenirim, hızlı karar veririm',
        'Araştırma yapar, birkaç kişiye danışırım',
        'Uzun süre düşünür, tüm riskleri analiz ederim'
      ]),
    },
  ],
  '22-24': [
    // Değişim Toleransı (2 soru)
    {
      text: 'Mevcut işinizde memnun olmadığınızda genellikle ne yaparsınız?',
      category: 'changeTolerance',
      options: JSON.stringify([
        'Hemen yeni iş aramaya başlarım',
        'Önce durumu iyileştirmeye çalışır, sonra değerlendiririm',
        'Güvenli bir alternatif bulana kadar sabrederim'
      ]),
    },
    {
      text: 'Tamamen farklı bir sektöre geçiş yapmak hakkında ne düşünürsünüz?',
      category: 'changeTolerance',
      options: JSON.stringify([
        'Heyecan verici buluyorum, yeni başlangıçlar severim',
        'Doğru fırsat olursa değerlendiririm',
        'Mevcut alanımda uzmanlaşmayı tercih ederim'
      ]),
    },
    // Belirsizlik Yönetimi (2 soru)
    {
      text: 'Ekonomik belirsizlik dönemlerinde kariyer kararlarınızı nasıl alırsınız?',
      category: 'uncertaintyMgmt',
      options: JSON.stringify([
        'Kriz dönemleri fırsat dönemleridir, cesur adımlar atarım',
        'Temkinli olurum ama tamamen durağan kalmam',
        'Güvenli limanda kalır, fırtına geçene kadar beklerim'
      ]),
    },
    {
      text: 'Size çok iyi bir maaş teklifi yapıldı ama şirket yeni ve belirsizlik var. Ne yaparsınız?',
      category: 'uncertaintyMgmt',
      options: JSON.stringify([
        'Fırsatı değerlendiririm, risk almadan kazanç olmaz',
        'Şirketi araştırır, artı ve eksileri karşılaştırırım',
        'Güvenilir bir şirkette daha düşük maaşı tercih ederim'
      ]),
    },
    // Girişimcilik Eğilimi (2 soru)
    {
      text: 'Kendi işinizi kurmayı hiç düşündünüz mü?',
      category: 'entrepreneurial',
      options: JSON.stringify([
        'Evet, aktif olarak planlıyorum',
        'Düşünüyorum ama önce daha fazla deneyim kazanmalıyım',
        'Hayır, düzenli gelir benim için daha önemli'
      ]),
    },
    {
      text: 'Bir iş fikriniz var ve yatırımcı arıyorsunuz. Nasıl bir strateji izlersiniz?',
      category: 'entrepreneurial',
      options: JSON.stringify([
        'Hemen pitch deck hazırlar, her fırsatta sunarım',
        'Önce MVP geliştirip sonuçlarla yatırımcıya giderim',
        'Kendi birikimlerimle küçük başlamayı tercih ederim'
      ]),
    },
    // Kariyer Esnekliği (2 soru)
    {
      text: 'Kariyer planlaması yaparken en önemli kriteriniz nedir?',
      category: 'careerFlexibility',
      options: JSON.stringify([
        'Hızlı yükselme ve büyüme fırsatları',
        'İş-yaşam dengesi ve kişisel gelişim',
        'İş güvencesi ve istikrar'
      ]),
    },
    {
      text: 'Yapay zeka ve otomasyon mesleğinizi tehdit etse ne yaparsınız?',
      category: 'careerFlexibility',
      options: JSON.stringify([
        'Yeni teknolojileri öğrenir, fırsata çeviririm',
        'Kendimi geliştirip adaptasyon sağlarım',
        'AI-proof bir alana geçiş yapmayı düşünürüm'
      ]),
    },
    // Karar Alma Tarzı (2 soru)
    {
      text: 'Bir yöneticilik pozisyonu teklif edildi ama daha fazla sorumluluk ve stres anlamına geliyor. Kararınız?',
      category: 'decisionStyle',
      options: JSON.stringify([
        'Kesinlikle kabul ederim, büyüme şansını kaçırmam',
        'Detayları öğrenir, hazır olup olmadığımı değerlendiririm',
        'Mevcut konumumda rahatım, stresi artırmak istemem'
      ]),
    },
    {
      text: 'İki iş teklifi aldınız: biri yüksek maaşlı ama uzun mesai, diğeri düşük maaşlı ama esnek. Ne yaparsınız?',
      category: 'decisionStyle',
      options: JSON.stringify([
        'Yüksek maaşlı olanı seçerim, para önemli',
        'Kariyer hedeflerime hangisi daha uygunsa onu seçerim',
        'Esnek olanı seçerim, yaşam kalitesi önceliğim'
      ]),
    },
  ],
};

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('Kariyer Risk Analizi soruları ekleniyor...');

    for (const { ageGroup, stageOrder, stageName } of AGE_GROUPS) {
      // Stage oluştur
      const [stageResult] = await connection.execute(
        'INSERT INTO stages (name, description, `order`, ageGroup) VALUES (?, ?, ?, ?)',
        [stageName, 'Kariyer kararlarındaki risk profilini, değişim toleransını ve girişimcilik eğilimini ölçen analiz.', stageOrder, ageGroup]
      );

      const stageId = stageResult.insertId;
      console.log(`  ${ageGroup} yaş grubu stage oluşturuldu: ID=${stageId}`);

      // Soruları ekle
      const questions = QUESTION_TEMPLATES[ageGroup];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await connection.execute(
          'INSERT INTO questions (stageId, text, type, `order`, options, category, `required`) VALUES (?, ?, \'multiple_choice\', ?, ?, ?, 1)',
          [stageId, q.text, i + 1, q.options, q.category]
        );
      }

      console.log(`  ${ageGroup} yaş grubu: ${questions.length} soru eklendi`);
    }

    // Doğrulama
    const [stages] = await connection.execute(
      `SELECT s.id, s.name, s.ageGroup, COUNT(q.id) as q_count
       FROM stages s
       LEFT JOIN questions q ON q.stageId = s.id
       WHERE s.name LIKE '%Risk%'
       GROUP BY s.id`
    );

    console.log('\nDoğrulama:');
    for (const s of stages) {
      console.log(`  Stage ${s.id}: ${s.name} (${s.ageGroup}) - ${s.q_count} soru`);
    }

    console.log('\nKariyer Risk Analizi soruları başarıyla eklendi!');
  } catch (error) {
    console.error('Hata:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
