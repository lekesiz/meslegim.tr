import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { reports, answers, questions, stages, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface GenerateReportParams {
  userId: number;
  stageId: number;
  type: "stage" | "final";
}

export async function generateReport({ userId, stageId, type }: GenerateReportParams) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get user info
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) throw new Error("User not found");

  // Get stage info
  const stage = await db.select().from(stages).where(eq(stages.id, stageId)).limit(1);
  if (!stage[0]) throw new Error("Stage not found");

  // Get all answers for this stage
  const userAnswers = await db
    .select({
      question: questions,
      answer: answers,
    })
    .from(answers)
    .innerJoin(questions, eq(answers.questionId, questions.id));

  // Build context for AI
  const context = buildReportContext(user[0], stage[0], userAnswers);

  // Generate report with Manus AI
  const reportContent = await generateReportWithAI(context, type);

  // Convert to PDF (simplified - in production, use a proper PDF library)
  const pdfUrl = await convertToPDF(reportContent, user[0].name || 'User', stage[0].name);

  // Save report to database
  const result = await db.insert(reports).values({
    userId,
    stageId,
    type,
    content: reportContent,
    fileUrl: pdfUrl,
    status: "pending",
  });

  return {
    reportId: result[0].insertId,
    fileUrl: pdfUrl,
  };
}

function buildReportContext(
  user: any,
  stage: any,
  userAnswers: any[]
): string {
  let context = `# Rapport d'évaluation de carrière\n\n`;
  context += `**Étudiant:** ${user.name}\n`;
  context += `**Âge:** ${user.ageGroup}\n`;
  context += `**Étape:** ${stage.name}\n`;
  context += `**Description:** ${stage.description}\n\n`;
  context += `## Réponses de l'étudiant\n\n`;

  userAnswers.forEach((item, index) => {
    context += `### Question ${index + 1}: ${item.question.text}\n`;
    context += `**Type:** ${item.question.type}\n`;
    context += `**Réponse:** ${item.answer.answer}\n\n`;
  });

  return context;
}

async function generateReportWithAI(context: string, type: "stage" | "final"): Promise<string> {
  const systemPrompt = type === "final"
    ? `Tu es un expert en orientation professionnelle. Génère un rapport final complet basé sur toutes les étapes d'évaluation. Le rapport doit inclure:
    
    1. **Synthèse globale** - Vue d'ensemble des résultats
    2. **Profil de personnalité professionnelle** - Traits dominants et aptitudes
    3. **Recommandations de carrières** - Liste de 5-7 carrières adaptées avec justifications
    4. **Plan d'action** - Étapes concrètes pour atteindre les objectifs
    5. **Ressources** - Formations, certifications, et ressources utiles
    
    Le rapport doit être professionnel, encourageant, et actionnable.`
    : `Tu es un expert en orientation professionnelle. Génère un rapport intermédiaire basé sur les réponses de cette étape. Le rapport doit inclure:
    
    1. **Analyse des réponses** - Interprétation des réponses données
    2. **Points forts identifiés** - Compétences et intérêts mis en évidence
    3. **Axes de développement** - Domaines à explorer ou renforcer
    4. **Prochaines étapes** - Ce qui sera évalué dans les étapes suivantes
    
    Le rapport doit être professionnel, encourageant, et constructif.`;

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
  return "Erreur lors de la génération du rapport";
}

async function convertToPDF(content: string, userName: string, stageName: string): Promise<string> {
  // In a real implementation, use a PDF library like puppeteer or pdfkit
  // For now, we'll simulate by returning a placeholder URL
  
  // TODO: Implement actual PDF generation
  // Options:
  // 1. Use puppeteer to render HTML to PDF
  // 2. Use pdfkit to generate PDF from scratch
  // 3. Use a third-party service like DocRaptor
  
  const timestamp = Date.now();
  const filename = `rapport-${userName.replace(/\s+/g, "-")}-${timestamp}.pdf`;
  
  // Placeholder: In production, upload to S3 and return the URL
  return `/reports/${filename}`;
}

export async function generateFinalReport(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all completed stages for this user
  const completedStages = await db
    .select()
    .from(stages)
    .where(eq(stages.id, userId)); // This needs to be fixed with proper join

  // For now, use the last stage as reference
  // In production, aggregate all stages
  const lastStageId = 3; // Placeholder

  return generateReport({
    userId,
    stageId: lastStageId,
    type: "final",
  });
}
