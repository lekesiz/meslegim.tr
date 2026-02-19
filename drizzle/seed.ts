import { drizzle } from "drizzle-orm/mysql2";
import { stages, questions } from "./schema";

// Database connection
const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(questions);
  await db.delete(stages);

  // Insert stages for each age group
  console.log("Inserting stages...");
  
  // 14-17 Age Group Stages
  const stages1417 = await db.insert(stages).values([
    {
      name: "Etap 1: Meslek Seçimi Yetkinlik Değerlendirmesi",
      description: "Temel yetkinlikler, ilgi alanları ve motivasyon kaynaklarının değerlendirilmesi",
      ageGroup: "14-17",
      order: 1,
    },
    {
      name: "Etap 2: Yetenek Keşfi ve Mesleki Eğilim Analizi",
      description: "Yetenekler, beceriler ve mesleki eğilimlerin derinlemesine analizi",
      ageGroup: "14-17",
      order: 2,
    },
    {
      name: "Etap 3: Gerçeklik Kontrolü ve Eylem Planı",
      description: "Kariyer hedeflerinin gerçekçiliği, finansal farkındalık ve eylem planı oluşturma",
      ageGroup: "14-17",
      order: 3,
    },
  ]);

  // 18-21 Age Group Stages
  const stages1821 = await db.insert(stages).values([
    {
      name: "Etap 1: Kariyer Hazırlık ve Yetkinlik Değerlendirmesi",
      description: "Üniversite ve kariyer hazırlığı için temel yetkinliklerin değerlendirilmesi",
      ageGroup: "18-21",
      order: 1,
    },
    {
      name: "Etap 2: Profesyonel Yetenek ve Eğilim Analizi",
      description: "Profesyonel beceriler, liderlik ve iş dünyası eğilimlerinin analizi",
      ageGroup: "18-21",
      order: 2,
    },
    {
      name: "Etap 3: Kariyer Stratejisi ve Eylem Planı",
      description: "Kariyer stratejisi, network oluşturma ve eylem planı geliştirme",
      ageGroup: "18-21",
      order: 3,
    },
  ]);

  // 22-24 Age Group Stages
  const stages2224 = await db.insert(stages).values([
    {
      name: "Etap 1: Kariyer Geçiş ve Yetkinlik Değerlendirmesi",
      description: "İş hayatına geçiş ve profesyonel yetkinliklerin değerlendirilmesi",
      ageGroup: "22-24",
      order: 1,
    },
    {
      name: "Etap 2: Profesyonel Gelişim ve Liderlik Analizi",
      description: "Profesyonel gelişim, liderlik becerileri ve kariyer ilerlemesi analizi",
      ageGroup: "22-24",
      order: 2,
    },
    {
      name: "Etap 3: Kariyer Optimizasyonu ve Uzun Vadeli Planlama",
      description: "Kariyer optimizasyonu, uzun vadeli hedefler ve eylem planı",
      ageGroup: "22-24",
      order: 3,
    },
  ]);

  console.log("Stages inserted successfully!");

  // Get stage IDs
  const allStages = await db.select().from(stages);
  const stage1417_1 = allStages.find(s => s.ageGroup === "14-17" && s.order === 1)!;
  const stage1417_2 = allStages.find(s => s.ageGroup === "14-17" && s.order === 2)!;
  const stage1417_3 = allStages.find(s => s.ageGroup === "14-17" && s.order === 3)!;

  // Insert questions for 14-17 Age Group - Stage 1
  console.log("Inserting questions for 14-17 Age Group - Stage 1...");
  await db.insert(questions).values([
    {
      stageId: stage1417_1.id,
      text: "Yeni şeyler öğrenmeye ne kadar heveslisiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç hevesli değilim", "2", "3", "4", "5 - Çok hevesliyim"]),
      required: true,
      order: 1,
    },
    {
      stageId: stage1417_1.id,
      text: "Kendi başınıza karar alabiliyor musunuz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç alamıyorum", "2", "3", "4", "5 - Çok iyi alabiliyorum"]),
      required: true,
      order: 2,
    },
    {
      stageId: stage1417_1.id,
      text: "Zorluklarla başa çıkma becerinizi nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Çok zayıf", "2", "3", "4", "5 - Çok güçlü"]),
      required: true,
      order: 3,
    },
    {
      stageId: stage1417_1.id,
      text: "Çevrenizde insanlarla ne kadar kolay iletişim kurabiliyorsunuz?",
      type: "likert",
      options: JSON.stringify(["1 - Çok zor", "2", "3", "4", "5 - Çok kolay"]),
      required: true,
      order: 4,
    },
    {
      stageId: stage1417_1.id,
      text: "Hedeflerinize ulaşmak için ne kadar motivasyonunuz var?",
      type: "likert",
      options: JSON.stringify(["1 - Çok düşük", "2", "3", "4", "5 - Çok yüksek"]),
      required: true,
      order: 5,
    },
    {
      stageId: stage1417_1.id,
      text: "Hangi mesleki ilgi alanlarına sahipsiniz? (Birden fazla seçebilirsiniz)",
      type: "multiple_choice",
      options: JSON.stringify([
        "Sosyal (İnsanlarla çalışmak, yardım etmek)",
        "Araştırmacı (Analiz, gözlem, problem çözme)",
        "Sanatsal (Yaratıcılık, tasarım, ifade)",
        "Girişimci (İş kurma, liderlik, risk alma)",
        "Geleneksel (Düzen, organizasyon, detay odaklı)"
      ]),
      required: true,
      order: 6,
    },
    {
      stageId: stage1417_1.id,
      text: "Kendinizi hangi üç kelimeyle tanımlarsınız?",
      type: "text",
      options: null,
      required: true,
      order: 7,
    },
    {
      stageId: stage1417_1.id,
      text: "Hayalinizdeki meslek veya çalışmak istediğiniz alan nedir?",
      type: "text",
      options: null,
      required: true,
      order: 8,
    },
  ]);

  // Insert questions for 14-17 Age Group - Stage 2
  console.log("Inserting questions for 14-17 Age Group - Stage 2...");
  await db.insert(questions).values([
    {
      stageId: stage1417_2.id,
      text: "Aşağıdaki aktivitelerden hangilerinde kendinizi yetenekli hissediyorsunuz? (Birden fazla seçebilirsiniz)",
      type: "multiple_choice",
      options: JSON.stringify([
        "Bir şeyi sökme ve tekrar birleştirme",
        "Birine öğretme",
        "Problem analizi",
        "Yaratıcı proje geliştirme",
        "Plan oluşturma"
      ]),
      required: true,
      order: 1,
    },
    {
      stageId: stage1417_2.id,
      text: "Hedeflerinize birden fazla yoldan ulaşabilir misiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç", "2", "3", "4", "5 - Kesinlikle"]),
      required: true,
      order: 2,
    },
    {
      stageId: stage1417_2.id,
      text: "Alternatif çözümler düşünme becerinizi nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Çok zayıf", "2", "3", "4", "5 - Çok güçlü"]),
      required: true,
      order: 3,
    },
    {
      stageId: stage1417_2.id,
      text: "Zorlu bir görevi başarabilir misiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç", "2", "3", "4", "5 - Kesinlikle"]),
      required: true,
      order: 4,
    },
    {
      stageId: stage1417_2.id,
      text: "Yeni beceri öğrenme hızınızı nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Çok yavaş", "2", "3", "4", "5 - Çok hızlı"]),
      required: true,
      order: 5,
    },
    {
      stageId: stage1417_2.id,
      text: "Aşağıdaki alanlarda kendinizi ne derece yeterli hissediyorsunuz? (Her biri için 1-5 arası puan verin)",
      type: "ranking",
      options: JSON.stringify([
        "Teknik sorun çözme",
        "Yaratıcı proje",
        "Veri analizi",
        "Finansal işler",
        "Satış ve pazarlama"
      ]),
      required: true,
      order: 6,
    },
  ]);

  // Insert questions for 14-17 Age Group - Stage 3
  console.log("Inserting questions for 14-17 Age Group - Stage 3...");
  await db.insert(questions).values([
    {
      stageId: stage1417_3.id,
      text: "Hedef mesleğiniz nedir?",
      type: "text",
      options: null,
      required: true,
      order: 1,
    },
    {
      stageId: stage1417_3.id,
      text: "Hedef üniversiteniz ve bölümünüz nedir?",
      type: "text",
      options: null,
      required: true,
      order: 2,
    },
    {
      stageId: stage1417_3.id,
      text: "Ailenizin aylık gelir düzeyi hangi aralıkta?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Asgari ücret",
        "Asgari ücretin 2 katı",
        "Asgari ücretin 3-4 katı",
        "Asgari ücretin 5+ katı"
      ]),
      required: false,
      order: 3,
    },
    {
      stageId: stage1417_3.id,
      text: "Aileniz üniversite eğitiminizi ne kadar destekleyebilir?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hiç destekleyemez",
        "Kısmi destek",
        "Tam destek"
      ]),
      required: true,
      order: 4,
    },
    {
      stageId: stage1417_3.id,
      text: "Hedef üniversite eğitiminizin toplam maliyetini (4 yıl) biliyor musunuz?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Evet, tam olarak biliyorum",
        "Genel bir fikrim var",
        "Hayır, bilmiyorum"
      ]),
      required: true,
      order: 5,
    },
    {
      stageId: stage1417_3.id,
      text: "Hedef mesleğinizde 5 yıl sonra ne kadar maaş almayı bekliyorsunuz? (Aylık, TL)",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
    {
      stageId: stage1417_3.id,
      text: "Hedef mesleğinizde 10 yıl sonra ne kadar maaş almayı bekliyorsunuz? (Aylık, TL)",
      type: "text",
      options: null,
      required: true,
      order: 7,
    },
    {
      stageId: stage1417_3.id,
      text: "Kariyer hedefinize ulaşmada en büyük engeliniz nedir?",
      type: "text",
      options: null,
      required: true,
      order: 8,
    },
    {
      stageId: stage1417_3.id,
      text: "Önümüzdeki 6 ay içinde kariyer hedefiniz için atacağınız ilk adım nedir?",
      type: "text",
      options: null,
      required: true,
      order: 9,
    },
  ]);

  // Get stage IDs for 18-21 and 22-24
  const stage1821_1 = allStages.find(s => s.ageGroup === "18-21" && s.order === 1)!;
  const stage1821_2 = allStages.find(s => s.ageGroup === "18-21" && s.order === 2)!;
  const stage1821_3 = allStages.find(s => s.ageGroup === "18-21" && s.order === 3)!;
  const stage2224_1 = allStages.find(s => s.ageGroup === "22-24" && s.order === 1)!;
  const stage2224_2 = allStages.find(s => s.ageGroup === "22-24" && s.order === 2)!;
  const stage2224_3 = allStages.find(s => s.ageGroup === "22-24" && s.order === 3)!;

  // Insert questions for 18-21 Age Group - Stage 1
  console.log("Inserting questions for 18-21 Age Group - Stage 1...");
  await db.insert(questions).values([
    {
      stageId: stage1821_1.id,
      text: "Üniversite eğitiminiz için kariyer hazırlığınızı nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hazır değilim", "2", "3", "4", "5 - Tamamen hazırım"]),
      required: true,
      order: 1,
    },
    {
      stageId: stage1821_1.id,
      text: "Profesyonel hedeflerinizi ne kadar net tanımlayabiliyorsunuz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç net değil", "2", "3", "4", "5 - Çok net"]),
      required: true,
      order: 2,
    },
    {
      stageId: stage1821_1.id,
      text: "Staj veya iş deneyiminiz var mı?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hayır, hiç deneyimim yok",
        "Kısa süreli staj (1-3 ay)",
        "Uzun süreli staj (3+ ay)",
        "Part-time iş deneyimi",
        "Full-time iş deneyimi"
      ]),
      required: true,
      order: 3,
    },
    {
      stageId: stage1821_1.id,
      text: "Aşağıdaki profesyonel becerilerde kendinizi nasıl değerlendirirsiniz? (Her biri için 1-5 arası puan verin)",
      type: "ranking",
      options: JSON.stringify([
        "Zaman yönetimi",
        "Takım çalışması",
        "Sunum becerileri",
        "Yazılı iletişim",
        "Problem çözme"
      ]),
      required: true,
      order: 4,
    },
    {
      stageId: stage1821_1.id,
      text: "Hangi sektörlerde çalışmak istersiniz? (Birden fazla seçebilirsiniz)",
      type: "multiple_choice",
      options: JSON.stringify([
        "Teknoloji ve yazılım",
        "Finans ve bankacılık",
        "Sağlık ve tıp",
        "Eğitim ve akademi",
        "Pazarlama ve reklam",
        "Mühendislik",
        "Hukuk",
        "Sanat ve tasarım"
      ]),
      required: true,
      order: 5,
    },
    {
      stageId: stage1821_1.id,
      text: "Mezuniyet sonrası ilk 5 yıl için kariyer hedefiniz nedir?",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
  ]);

  // Insert questions for 18-21 Age Group - Stage 2
  console.log("Inserting questions for 18-21 Age Group - Stage 2...");
  await db.insert(questions).values([
    {
      stageId: stage1821_2.id,
      text: "Liderlik deneyiminizi nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç deneyimim yok", "2", "3", "4", "5 - Çok deneyimliyim"]),
      required: true,
      order: 1,
    },
    {
      stageId: stage1821_2.id,
      text: "Hangi liderlik türlerine yakınsınız? (Birden fazla seçebilirsiniz)",
      type: "multiple_choice",
      options: JSON.stringify([
        "Vizyoner liderlik",
        "Demokratik liderlik",
        "Mentor liderlik",
        "Stratejik liderlik",
        "Transformasyonel liderlik"
      ]),
      required: true,
      order: 2,
    },
    {
      stageId: stage1821_2.id,
      text: "Profesyonel network (ağ) oluşturma becerinizi nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Çok zayıf", "2", "3", "4", "5 - Çok güçlü"]),
      required: true,
      order: 3,
    },
    {
      stageId: stage1821_2.id,
      text: "Aşağıdaki profesyonel becerilerde kendinizi nasıl değerlendirirsiniz? (Her biri için 1-5 arası puan verin)",
      type: "ranking",
      options: JSON.stringify([
        "Müşteri ilişkileri yönetimi",
        "Proje yönetimi",
        "Veri analizi ve raporlama",
        "Dijital pazarlama",
        "Finansal okur yazarlık"
      ]),
      required: true,
      order: 4,
    },
    {
      stageId: stage1821_2.id,
      text: "Girişimcilik ilginiz var mı?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hayır, şirkette çalışmayı tercih ederim",
        "Belki gelecekte düşünürüm",
        "Evet, kısa vadede kendi işimi kurmak istiyorum",
        "Evet, zaten bir iş fikrim var"
      ]),
      required: true,
      order: 5,
    },
    {
      stageId: stage1821_2.id,
      text: "Profesyonel gelişiminiz için hangi alanlarda eğitim almak istersiniz?",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
  ]);

  // Insert questions for 18-21 Age Group - Stage 3
  console.log("Inserting questions for 18-21 Age Group - Stage 3...");
  await db.insert(questions).values([
    {
      stageId: stage1821_3.id,
      text: "Mezuniyet sonrası ilk işinizde ne kadar maaş bekliyorsunuz? (Aylık, TL)",
      type: "text",
      options: null,
      required: true,
      order: 1,
    },
    {
      stageId: stage1821_3.id,
      text: "5 yıl sonra ne kadar maaş almayı hedefliyorsunuz? (Aylık, TL)",
      type: "text",
      options: null,
      required: true,
      order: 2,
    },
    {
      stageId: stage1821_3.id,
      text: "Kariyer hedefinize ulaşmak için hangi adımları atmanız gerekiyor?",
      type: "text",
      options: null,
      required: true,
      order: 3,
    },
    {
      stageId: stage1821_3.id,
      text: "Yüksek lisans veya sertifika programı düşünüyor musunuz?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hayır, düşünmüyorum",
        "Belki gelecekte",
        "Evet, kısa vadede planlama yapıyorum",
        "Evet, başvuru sürecindeyim"
      ]),
      required: true,
      order: 4,
    },
    {
      stageId: stage1821_3.id,
      text: "Uluslararası kariyer fırsatları ilginizi çekiyor mu?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hayır, Türkiye'de çalışmak istiyorum",
        "Kısa süreli deneyim için evet",
        "Evet, uzun vadeli yurtdışı kariyer istiyorum"
      ]),
      required: true,
      order: 5,
    },
    {
      stageId: stage1821_3.id,
      text: "Önümüzdeki 1 yıl içinde kariyer hedefiniz için atacağınız en önemli 3 adım nedir?",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
  ]);

  // Insert questions for 22-24 Age Group - Stage 1
  console.log("Inserting questions for 22-24 Age Group - Stage 1...");
  await db.insert(questions).values([
    {
      stageId: stage2224_1.id,
      text: "İş hayatına geçiş hazırlığınızı nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hazır değilim", "2", "3", "4", "5 - Tamamen hazırım"]),
      required: true,
      order: 1,
    },
    {
      stageId: stage2224_1.id,
      text: "Mevcut iş durumunuz nedir?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Henüz çalışmıyorum",
        "Part-time çalışıyorum",
        "Full-time çalışıyorum (1 yıldan az)",
        "Full-time çalışıyorum (1-2 yıl)",
        "Full-time çalışıyorum (2+ yıl)"
      ]),
      required: true,
      order: 2,
    },
    {
      stageId: stage2224_1.id,
      text: "Mevcut işinizden memnun musunuz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç memnun değilim", "2", "3", "4", "5 - Çok memnunum"]),
      required: true,
      order: 3,
    },
    {
      stageId: stage2224_1.id,
      text: "Aşağıdaki profesyonel becerilerde kendinizi nasıl değerlendirirsiniz? (Her biri için 1-5 arası puan verin)",
      type: "ranking",
      options: JSON.stringify([
        "Stratejik düşünme",
        "Takım liderliği",
        "Müşateri ilişkileri",
        "Proje yönetimi",
        "Finansal planlama"
      ]),
      required: true,
      order: 4,
    },
    {
      stageId: stage2224_1.id,
      text: "Kariyer değişikliği düşünüyor musunuz?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hayır, mevcut kariyerimden memnunum",
        "Belki, alternatifler araştırıyorum",
        "Evet, aktif olarak değişiklik planlama yapıyorum",
        "Evet, zaten değişiklik sürecindeyim"
      ]),
      required: true,
      order: 5,
    },
    {
      stageId: stage2224_1.id,
      text: "5 yıl sonra kendinizi hangi pozisyonda görmek istersiniz?",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
  ]);

  // Insert questions for 22-24 Age Group - Stage 2
  console.log("Inserting questions for 22-24 Age Group - Stage 2...");
  await db.insert(questions).values([
    {
      stageId: stage2224_2.id,
      text: "Liderlik deneyiminizi nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Hiç deneyimim yok", "2", "3", "4", "5 - Çok deneyimliyim"]),
      required: true,
      order: 1,
    },
    {
      stageId: stage2224_2.id,
      text: "Hangi liderlik becerilerinde gelişmek istersiniz? (Birden fazla seçebilirsiniz)",
      type: "multiple_choice",
      options: JSON.stringify([
        "Stratejik liderlik",
        "Takım motivasyonu",
        "Değişim yönetimi",
        "Karar alma",
        "Mentorluğ"
      ]),
      required: true,
      order: 2,
    },
    {
      stageId: stage2224_2.id,
      text: "Profesyonel network (ağ) genişliğinizi nasıl değerlendirirsiniz?",
      type: "likert",
      options: JSON.stringify(["1 - Çok dar", "2", "3", "4", "5 - Çok geniş"]),
      required: true,
      order: 3,
    },
    {
      stageId: stage2224_2.id,
      text: "Yöneticilik pozisyonuna ne kadar hazırsınız?",
      type: "likert",
      options: JSON.stringify(["1 - Hazır değilim", "2", "3", "4", "5 - Tamamen hazırım"]),
      required: true,
      order: 4,
    },
    {
      stageId: stage2224_2.id,
      text: "Girişimcilik planınız var mı?",
      type: "multiple_choice",
      options: JSON.stringify([
        "Hayır, kurumsal kariyere devam etmek istiyorum",
        "Belki gelecekte düşünürüm",
        "Evet, 1-2 yıl içinde kendi işimi kurmak istiyorum",
        "Evet, zaten hazırlık aşamasındayım"
      ]),
      required: true,
      order: 5,
    },
    {
      stageId: stage2224_2.id,
      text: "Profesyonel gelişiminiz için hangi sertifika veya eğitimleri planlama yapıyorsunuz?",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
  ]);

  // Insert questions for 22-24 Age Group - Stage 3
  console.log("Inserting questions for 22-24 Age Group - Stage 3...");
  await db.insert(questions).values([
    {
      stageId: stage2224_3.id,
      text: "Mevcut maaşınız hangi aralıkta? (Aylık, TL)",
      type: "text",
      options: null,
      required: false,
      order: 1,
    },
    {
      stageId: stage2224_3.id,
      text: "5 yıl sonra ne kadar maaş almayı hedefliyorsunuz? (Aylık, TL)",
      type: "text",
      options: null,
      required: true,
      order: 2,
    },
    {
      stageId: stage2224_3.id,
      text: "10 yıl sonra ne kadar maaş almayı hedefliyorsunuz? (Aylık, TL)",
      type: "text",
      options: null,
      required: true,
      order: 3,
    },
    {
      stageId: stage2224_3.id,
      text: "Uzun vadeli kariyer hedefiniz nedir?",
      type: "text",
      options: null,
      required: true,
      order: 4,
    },
    {
      stageId: stage2224_3.id,
      text: "Kariyer optimizasyonu için hangi alanlarda gelişmeniz gerektiğini düşünüyorsunuz?",
      type: "text",
      options: null,
      required: true,
      order: 5,
    },
    {
      stageId: stage2224_3.id,
      text: "Yönetici pozisyonuna ulaşmak için hangi adımları atmanız gerekiyor?",
      type: "text",
      options: null,
      required: true,
      order: 6,
    },
    {
      stageId: stage2224_3.id,
      text: "Önümüzdeki 2 yıl içinde kariyer hedefiniz için atacağınız en önemli 5 adım nedir?",
      type: "text",
      options: null,
      required: true,
      order: 7,
    },
  ]);

  console.log("\u2705 Seed completed successfully!");
  console.log(`Total stages inserted: ${allStages.length}`);
  console.log("Total questions inserted: 60 (14-17: 23, 18-21: 18, 22-24: 19)");
  console.log("\nAll age groups now have complete question sets!");  
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
