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

  console.log("✅ Seed completed successfully!");
  console.log(`Total stages inserted: ${allStages.length}`);
  console.log("Total questions inserted: 23 (for 14-17 age group)");
  console.log("\nNote: Questions for 18-21 and 22-24 age groups will be added in the next iteration.");
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
