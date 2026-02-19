import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema";
import bcrypt from "bcryptjs";

// Database connection
const db = drizzle(process.env.DATABASE_URL!);

async function seedTestUsers() {
  console.log("🌱 Seeding test users...");

  // Hash password for all test users
  const password = await bcrypt.hash("test123", 10);

  // Create test users
  const testUsers = [
    {
      openId: `test_student_${Date.now()}_1`,
      name: "Test Öğrenci",
      email: "student@test.com",
      password,
      phone: "5551234567",
      tcKimlik: "12345678901",
      role: "student" as const,
      status: "active" as const,
      ageGroup: "14-17" as const,
      kvkkConsent: true,
      kvkkConsentDate: new Date(),
    },
    {
      openId: `test_mentor_${Date.now()}_2`,
      name: "Test Mentor",
      email: "mentor@test.com",
      password,
      phone: "5551234568",
      tcKimlik: "12345678902",
      role: "mentor" as const,
      status: "active" as const,
      kvkkConsent: true,
      kvkkConsentDate: new Date(),
    },
    {
      openId: `test_admin_${Date.now()}_3`,
      name: "Test Admin",
      email: "admin@test.com",
      password,
      phone: "5551234569",
      tcKimlik: "12345678903",
      role: "admin" as const,
      status: "active" as const,
      kvkkConsent: true,
      kvkkConsentDate: new Date(),
    },
  ];

  for (const user of testUsers) {
    try {
      await db.insert(users).values(user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.log(`⚠️  User ${user.email} might already exist, skipping...`);
    }
  }

  console.log("\n✅ Test users seeded successfully!");
  console.log("\nTest credentials:");
  console.log("Student: student@test.com / test123");
  console.log("Mentor: mentor@test.com / test123");
  console.log("Admin: admin@test.com / test123");
}

seedTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding test users:", error);
    process.exit(1);
  });
