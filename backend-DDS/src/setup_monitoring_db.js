import { pool } from './database/db.js';

async function updateSchema() {
    console.log('Updating schema for Monitoring...');
    const client = await pool.connect();
    try {
        // Crear tabla RequestLog
        await client.query(`
      CREATE TABLE IF NOT EXISTS RequestLog (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10),
        url VARCHAR(255),
        status INT,
        duration INT, -- milisegundos
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Table RequestLog ready.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema();
