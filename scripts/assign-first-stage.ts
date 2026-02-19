import { drizzle } from "drizzle-orm/mysql2";
import { users, stages, userStages } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Database connection
const db = drizzle(process.env.DATABASE_URL!);

async function assignFirstStage() {
  console.log("🔄 Assigning first stage to test student...");

  // Get test student
  const [student] = await db
    .select()
    .from(users)
    .where(eq(users.email, "student@test.com"))
    .limit(1);

  if (!student) {
    console.error("❌ Test student not found");
    return;
  }

  console.log(`✅ Found student: ${student.name} (${student.email})`);
  console.log(`   Age group: ${student.ageGroup}`);

  // Get first stage for student's age group
  const [firstStage] = await db
    .select()
    .from(stages)
    .where(and(eq(stages.ageGroup, student.ageGroup!), eq(stages.order, 1)))
    .limit(1);

  if (!firstStage) {
    console.error(`❌ No first stage found for age group ${student.ageGroup}`);
    return;
  }

  console.log(`✅ Found first stage: ${firstStage.name}`);

  // Check if already assigned
  const existing = await db
    .select()
    .from(userStages)
    .where(
      and(eq(userStages.userId, student.id), eq(userStages.stageId, firstStage.id))
    )
    .limit(1);

  if (existing.length > 0) {
    console.log("⚠️  Stage already assigned");
    return;
  }

  // Assign first stage
  await db.insert(userStages).values({
    userId: student.id,
    stageId: firstStage.id,
    status: "active",
    activatedAt: new Date(),
  });

  console.log("✅ First stage assigned successfully!");
}

assignFirstStage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error assigning first stage:", error);
    process.exit(1);
  });
