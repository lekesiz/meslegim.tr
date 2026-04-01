import bcrypt from 'bcryptjs';
import { createRequire } from 'module';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true }
  });

  const newHash = await bcrypt.hash('test123', 10);
  
  const emails = ['student@test.com', 'mentor@test.com'];
  
  for (const email of emails) {
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [newHash, email]
    );
    console.log(`Updated ${email}: ${result.affectedRows} rows affected`);
  }

  await connection.end();
  console.log('Done!');
}

main().catch(console.error);
