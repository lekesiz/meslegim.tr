import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Questions tablo yapısını öğren
const [cols] = await conn.execute('DESCRIBE questions');
console.log('Questions kolonları:', cols.map(r => r.Field).join(', '));

// Etap 1 ve 2 sorularını getir
const [rows] = await conn.execute(`
  SELECT s.id as stageId, s.name as stageName, s.ageGroup, 
         q.id as qId, q.order as qOrder, q.text as questionText, q.type, q.options
  FROM stages s
  JOIN questions q ON q.stageId = s.id
  WHERE s.id IN (60001, 60002, 60004, 60005, 60007, 60008)
  ORDER BY s.id, q.order
`);

let currentStage = null;
for (const row of rows) {
  if (row.stageId !== currentStage) {
    currentStage = row.stageId;
    console.log(`\n=== ${row.stageName} | Yaş: ${row.ageGroup} | ID: ${row.stageId} ===`);
  }
  let opts = null;
  if (row.options) {
    try { opts = typeof row.options === 'string' ? JSON.parse(row.options) : row.options; } catch(e) { opts = row.options.split(','); }
  }
  console.log(`${row.qOrder}. [${row.type}] ${row.questionText.substring(0, 100)}`);
  if (opts && opts.length > 0) {
    console.log(`   → ${opts.slice(0, 3).join(' | ')}${opts.length > 3 ? ' ...' : ''}`);
  }
}

await conn.end();
console.log('\nToplam soru sayısı:', rows.length);
