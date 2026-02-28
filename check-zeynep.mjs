import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

const [users] = await conn.execute(
  'SELECT id, name, email, role, status, mentorId FROM users WHERE id IN (930101, 930014)'
);
console.log('Users:', JSON.stringify(users, null, 2));

const [reports] = await conn.execute(
  'SELECT id, userId, stageId, status, approvedBy FROM reports WHERE userId = 930101'
);
console.log('Reports:', JSON.stringify(reports, null, 2));

await conn.end();
process.exit(0);
