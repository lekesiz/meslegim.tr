import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const users = await db.select().from(schema.user).where(sql`email = 'test.simulasyon@test.com'`);
console.log(JSON.stringify(users, null, 2));

await connection.end();
