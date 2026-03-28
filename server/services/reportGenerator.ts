import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { reports, answers, questions, stages, users, userStages } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

interface GenerateReportParams {
  userId: number;
  stageId: number;
  type: "stage" | "final";
}

export async function generateReport({ userId, stageId, type }: GenerateReportParams) {
  const db = await getDb();
  if (!db) throw new Error("Veritabanı bağlantısı kurulamadı");

  // Kullanıcı bilgilerini al
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) throw new Error("Kullanıcı bulunamadı");

  // Etap bilgilerini al
  const stage = await db.select().from(stages).where(eq(stages.id, stageId)).limit(1);
  if (!stage[0]) throw new Error("Etap bulunamadı");

  // Bu etap için tüm cevapları al
  const stageQuestions = await db.select().from(questions).where(eq(questions.stageId, stageId));
  const questionIds = stageQuestions.map(q => q.id);
  
  let userAnswers: Array<{ question: any; answer: any }> = [];
  if (questionIds.length > 0) {
    const allAnswers = await db
      .select({
        question: questions,
        answer: answers,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(eq(answers.userId, userId));
    
    userAnswers = allAnswers.filter(a => questionIds.includes(a.question.id));
  } else {
    const userAnswersRaw = await db
      .select({
        question: questions,
        answer: answers,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .where(eq(answers.userId, userId));
    userAnswers = userAnswersRaw;
  }

  // AI için bağlam oluştur
  const context = buildReportContext(user[0], stage[0], userAnswers);

  // Manus AI ile rapor oluştur
  const reportContent = await generateReportWithAI(context, type);

  return reportContent;
}

function buildReportContext(
  user: any,
  stage: any,
  userAnswers: any[]
): string {
  let context = `# Kariyer Değerlendirme Raporu\n\n`;
  context += `**Öğrenci:** ${user.name}\n`;
  context += `**Yaş Grubu:** ${user.ageGroup}\n`;
  context += `**Etap:** ${stage.name}\n`;
  context += `**Açıklama:** ${stage.description}\n\n`;
  context += `## Öğrenci Yanıtları\n\n`;

  userAnswers.forEach((item, index) => {
    context += `### Soru ${index + 1}: ${item.question.text}\n`;
    context += `**Tür:** ${item.question.type}\n`;
    context += `**Yanıt:** ${item.answer.answer}\n\n`;
  });

  return context;
}

async function generateReportWithAI(context: string, type: "stage" | "final"): Promise<string> {
  const systemPrompt = type === "final"
    ? `Sen deneyimli bir kariyer danışmanı ve mesleki yönlendirme uzmanısın. Türkiye'deki 14-24 yaş arası gençlere yönelik kapsamlı bir final kariyer değerlendirme raporu oluştur. Rapor Türkçe olmalı ve şu bölümleri içermeli:

    1. **Genel Değerlendirme** - Tüm etaplardaki sonuçların özeti
    2. **Kişilik ve Yetenek Profili** - Baskın kişilik özellikleri, güçlü yönler ve yetenekler
    3. **İlgi Alanları Analizi** - RIASEC modeline göre ilgi alanları değerlendirmesi
    4. **Kariyer Önerileri** - 5-7 uygun meslek önerisi, her biri için:
       - Mesleğin tanımı
       - Neden uygun olduğu
       - Gerekli eğitim ve yetkinlikler
       - Türkiye'deki iş piyasası durumu
    5. **Gelişim Planı** - Somut adımlar ve hedefler
    6. **Eğitim Yol Haritası** - Önerilen üniversite bölümleri, sertifikalar ve kurslar
    7. **Kaynaklar** - Faydalı web siteleri, kitaplar ve platformlar

    Rapor profesyonel, cesaretlendirici ve uygulanabilir olmalı. Gencin yaş grubuna uygun bir dil kullan.`
    : `Sen deneyimli bir kariyer danışmanı ve mesleki yönlendirme uzmanısın. Türkiye'deki 14-24 yaş arası gençlere yönelik bir etap değerlendirme raporu oluştur. Rapor Türkçe olmalı ve şu bölümleri içermeli:

    1. **Yanıt Analizi** - Verilen yanıtların detaylı yorumu
    2. **Tespit Edilen Güçlü Yönler** - Öne çıkan yetkinlikler ve ilgi alanları
    3. **Gelişim Alanları** - Keşfedilmesi veya güçlendirilmesi gereken alanlar
    4. **Ön Kariyer İpuçları** - Bu etaptaki yanıtlara göre olası kariyer yönleri
    5. **Sonraki Adımlar** - Gelecek etaplarda nelerin değerlendirileceği

    Rapor profesyonel, cesaretlendirici ve yapıcı olmalı. Gencin yaş grubuna uygun bir dil kullan.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: context },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content === 'string') {
    return content;
  }
  return "Rapor oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.";
}

export async function generateFinalReport(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Veritabanı bağlantısı kurulamadı");

  // Kullanıcının tamamladığı tüm etapları al
  const completedUserStages = await db
    .select()
    .from(userStages)
    .where(and(eq(userStages.userId, userId), eq(userStages.status, 'completed')));

  if (completedUserStages.length === 0) {
    throw new Error("Tamamlanmış etap bulunamadı");
  }

  // Son tamamlanan etabı referans al
  const lastStage = completedUserStages[completedUserStages.length - 1];

  return generateReport({
    userId,
    stageId: lastStage.stageId,
    type: "final",
  });
}
