import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Zeynep'i test mentor'a ata (930014)
const [result] = await conn.execute(
  'UPDATE users SET mentorId = 930014 WHERE id = 930101'
);
console.log('Updated Zeynep mentorId to 930014:', result.affectedRows, 'rows affected');

// Doğrula
const [users] = await conn.execute(
  'SELECT id, name, mentorId FROM users WHERE id = 930101'
);
console.log('Zeynep after update:', JSON.stringify(users, null, 2));

await conn.end();
process.exit(0);
