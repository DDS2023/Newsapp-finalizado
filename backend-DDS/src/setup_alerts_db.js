import { pool } from './database/db.js';

async function updateSchema() {
    console.log('Updating schema for Alerts...');
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS Alert (
        id SERIAL PRIMARY KEY,
        mensaje VARCHAR(500) NOT NULL,
        fecha TIMESTAMP DEFAULT NOW(),
        leida BOOLEAN DEFAULT FALSE,
        searchId INT,
        userId INT NOT NULL,
        CONSTRAINT FK_Alert_User FOREIGN KEY (userId) REFERENCES "User"(id),
        CONSTRAINT FK_Alert_Search FOREIGN KEY (searchId) REFERENCES Search(id)
      );
    `);
        console.log('Table Alert ready.');

        try {
            await client.query(`ALTER TABLE Search ADD COLUMN lastCheckedAt TIMESTAMP DEFAULT NULL;`);
            console.log('Added lastCheckedAt to Search.');
        } catch (e) {
            console.log('Column lastCheckedAt probably exists or other error:', e.message);
        }

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema();
