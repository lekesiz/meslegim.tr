import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Lütfen bir e-posta adresi belirtin: pnpm tsx scripts/set-admin.ts <email>");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL ortam değişkeni bulunamadı.");
    process.exit(1);
  }

  const pool = mysql.createPool({ uri: connectionString });
  const db = drizzle(pool);

  console.log(`${email} için yetkiler güncelleniyor...`);
  
  const result = await db.update(users)
    .set({ role: 'super_admin', status: 'active' })
    .where(eq(users.email, email));

  console.log("İşlem tamamlandı. Etkilenen satır sayısı:", (result as any)[0]?.affectedRows ?? "Bilinmiyor");
  process.exit(0);
}

main().catch(console.error);
