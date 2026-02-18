import { pool } from './database/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    const schemaPath = path.resolve(__dirname, '../schema_postgres.sql');
    console.log(`Reading schema from: ${schemaPath}`);

    try {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const client = await pool.connect();

        try {
            console.log('Applying schema statements individualy...');
            const statements = schemaSql.split(/;\s*$/m).filter(stmt => stmt.trim().length > 0);

            for (const statement of statements) {
                try {
                    if (statement.trim()) {
                        await client.query(statement);
                        console.log('Executed statement successfully.');
                    }
                } catch (stmtErr) {
                    if (stmtErr.message.includes("already exists")) {
                        console.log(`Skipping existing relation: ${stmtErr.message}`);
                    } else {
                        console.error('Error executing statement:', stmtErr.message);
                        console.error('Statement was:', statement.substring(0, 50) + '...');
                    }
                }
            }
            console.log('Schema application process finished.');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('File read error:', err);
    } finally {
        await pool.end();
    }
}

setupDatabase();
