import { drizzle } from "drizzle-orm/mysql2";
import { stages, questions } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const stagesData = [
  // Groupe 14-17 ans
  {
    name: "Étape 1: Découverte de soi",
    description: "Exploration des intérêts personnels et des valeurs",
    ageGroup: "14-17" as const,
    order: 1,
  },
  {
    name: "Étape 2: Compétences et aptitudes",
    description: "Évaluation des compétences académiques et pratiques",
    ageGroup: "14-17" as const,
    order: 2,
  },
  {
    name: "Étape 3: Exploration des carrières",
    description: "Découverte des options de carrière adaptées",
    ageGroup: "14-17" as const,
    order: 3,
  },
  
  // Groupe 18-21 ans
  {
    name: "Étape 1: Bilan personnel",
    description: "Analyse approfondie des forces et faiblesses",
    ageGroup: "18-21" as const,
    order: 1,
  },
  {
    name: "Étape 2: Compétences professionnelles",
    description: "Évaluation des compétences transférables",
    ageGroup: "18-21" as const,
    order: 2,
  },
  {
    name: "Étape 3: Planification de carrière",
    description: "Élaboration d'un plan de carrière réaliste",
    ageGroup: "18-21" as const,
    order: 3,
  },
  
  // Groupe 22-24 ans
  {
    name: "Étape 1: Évaluation professionnelle",
    description: "Analyse de l'expérience et des compétences acquises",
    ageGroup: "22-24" as const,
    order: 1,
  },
  {
    name: "Étape 2: Positionnement sur le marché",
    description: "Évaluation de la position sur le marché du travail",
    ageGroup: "22-24" as const,
    order: 2,
  },
  {
    name: "Étape 3: Stratégie de développement",
    description: "Plan d'action pour l'évolution professionnelle",
    ageGroup: "22-24" as const,
    order: 3,
  },
];

const questionsData = {
  // Questions pour 14-17 ans - Étape 1
  "14-17-1": [
    {
      text: "Quelles matières scolaires vous intéressent le plus?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Sciences (Mathématiques, Physique, Chimie)",
        "Langues et Littérature",
        "Sciences Sociales (Histoire, Géographie)",
        "Arts (Musique, Arts Visuels)",
        "Éducation Physique et Sports",
        "Technologie et Informatique"
      ]),
      required: true,
      order: 1,
    },
    {
      text: "Comment évaluez-vous votre capacité à travailler en équipe?",
      type: "likert" as const,
      options: JSON.stringify([
        "1 - Très faible",
        "2 - Faible",
        "3 - Moyen",
        "4 - Bon",
        "5 - Excellent"
      ]),
      required: true,
      order: 2,
    },
    {
      text: "Quelles activités extra-scolaires pratiquez-vous?",
      type: "text" as const,
      options: null,
      required: false,
      order: 3,
    },
    {
      text: "Classez ces valeurs par ordre d'importance pour vous:",
      type: "ranking" as const,
      options: JSON.stringify([
        "Aider les autres",
        "Gagner beaucoup d'argent",
        "Être créatif",
        "Avoir un impact social",
        "Travailler en autonomie"
      ]),
      required: true,
      order: 4,
    },
  ],
  
  // Questions pour 14-17 ans - Étape 2
  "14-17-2": [
    {
      text: "Dans quels domaines vous sentez-vous le plus compétent?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Résolution de problèmes mathématiques",
        "Communication écrite",
        "Communication orale",
        "Travail manuel et pratique",
        "Créativité artistique",
        "Leadership"
      ]),
      required: true,
      order: 1,
    },
    {
      text: "Comment évaluez-vous votre capacité d'organisation?",
      type: "likert" as const,
      options: JSON.stringify([
        "1 - Très faible",
        "2 - Faible",
        "3 - Moyen",
        "4 - Bon",
        "5 - Excellent"
      ]),
      required: true,
      order: 2,
    },
  ],
  
  // Questions pour 14-17 ans - Étape 3
  "14-17-3": [
    {
      text: "Quels types de métiers vous attirent?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Métiers techniques (ingénieur, technicien)",
        "Métiers de la santé (médecin, infirmier)",
        "Métiers de l'éducation (enseignant, formateur)",
        "Métiers créatifs (designer, artiste)",
        "Métiers du commerce (vendeur, manager)",
        "Métiers du social (travailleur social, psychologue)"
      ]),
      required: true,
      order: 1,
    },
  ],
  
  // Questions pour 18-21 ans - Étape 1
  "18-21-1": [
    {
      text: "Quelle est votre situation actuelle?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Étudiant à l'université",
        "En formation professionnelle",
        "En recherche d'emploi",
        "En stage",
        "Travailleur à temps partiel"
      ]),
      required: true,
      order: 1,
    },
    {
      text: "Comment évaluez-vous votre niveau de motivation professionnelle?",
      type: "likert" as const,
      options: JSON.stringify([
        "1 - Très faible",
        "2 - Faible",
        "3 - Moyen",
        "4 - Élevé",
        "5 - Très élevé"
      ]),
      required: true,
      order: 2,
    },
  ],
  
  // Questions pour 18-21 ans - Étape 2
  "18-21-2": [
    {
      text: "Quelles compétences professionnelles possédez-vous?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Gestion de projet",
        "Communication professionnelle",
        "Compétences informatiques",
        "Langues étrangères",
        "Analyse de données",
        "Service client"
      ]),
      required: true,
      order: 1,
    },
  ],
  
  // Questions pour 18-21 ans - Étape 3
  "18-21-3": [
    {
      text: "Quel est votre objectif professionnel à 5 ans?",
      type: "text" as const,
      options: null,
      required: true,
      order: 1,
    },
  ],
  
  // Questions pour 22-24 ans - Étape 1
  "22-24-1": [
    {
      text: "Combien d'années d'expérience professionnelle avez-vous?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Moins d'1 an",
        "1-2 ans",
        "2-3 ans",
        "Plus de 3 ans"
      ]),
      required: true,
      order: 1,
    },
    {
      text: "Comment évaluez-vous votre niveau d'expertise dans votre domaine?",
      type: "likert" as const,
      options: JSON.stringify([
        "1 - Débutant",
        "2 - Intermédiaire",
        "3 - Compétent",
        "4 - Avancé",
        "5 - Expert"
      ]),
      required: true,
      order: 2,
    },
  ],
  
  // Questions pour 22-24 ans - Étape 2
  "22-24-2": [
    {
      text: "Quels sont vos principaux atouts professionnels?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Expérience pratique",
        "Réseau professionnel",
        "Compétences techniques spécialisées",
        "Capacité d'adaptation",
        "Leadership",
        "Innovation"
      ]),
      required: true,
      order: 1,
    },
  ],
  
  // Questions pour 22-24 ans - Étape 3
  "22-24-3": [
    {
      text: "Quelles actions comptez-vous entreprendre pour votre développement professionnel?",
      type: "multiple_choice" as const,
      options: JSON.stringify([
        "Formation continue",
        "Certification professionnelle",
        "Changement d'entreprise",
        "Création d'entreprise",
        "Spécialisation dans un domaine",
        "Développement de réseau"
      ]),
      required: true,
      order: 1,
    },
  ],
};

async function seed() {
  console.log("🌱 Début du seeding des étapes et questions...");

  try {
    // Insert stages
    console.log("📝 Insertion des étapes...");
    const insertedStages: any[] = [];
    
    for (const stage of stagesData) {
      const result = await db.insert(stages).values(stage);
      insertedStages.push({ ...stage, id: result[0].insertId });
      console.log(`✅ Étape créée: ${stage.name}`);
    }

    // Insert questions
    console.log("\n📝 Insertion des questions...");
    let totalQuestions = 0;
    
    for (const stage of insertedStages) {
      const key = `${stage.ageGroup}-${stage.order}`;
      const stageQuestions = questionsData[key as keyof typeof questionsData];
      
      if (stageQuestions) {
        for (const question of stageQuestions) {
          await db.insert(questions).values({
            ...question,
            stageId: stage.id,
          });
          totalQuestions++;
        }
        console.log(`✅ ${stageQuestions.length} questions créées pour ${stage.name}`);
      }
    }

    console.log(`\n✨ Seeding terminé avec succès!`);
    console.log(`📊 ${insertedStages.length} étapes créées`);
    console.log(`📊 ${totalQuestions} questions créées`);
    
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("✅ Script terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
