import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

export async function initDatabase() {
  console.log('🚀 Initializing Life RPG database schema...');
  let schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.join(__dirname, '../../src/database/schema.sql');
  }
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.join(process.cwd(), 'src/database/schema.sql');
  }

  try {
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(sql);
    console.log('✅ Life RPG database schema initialized successfully!');
  } catch (error: any) {
    console.error('❌ Failed to initialize database schema:', error.message);
    throw error;
  }
}

// Execute directly if run via CLI
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
