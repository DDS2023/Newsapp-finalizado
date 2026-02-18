import { pool } from './database/db.js';

async function verifyConnection() {
    console.log('Verifying connection...');

    // Como verify_db.js -> importa db.js -> importa dotenv/config, las variables deberían estar aquí también.
    console.log('Environment Debug:', {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        password_exists: !!process.env.DB_PASSWORD
    });

    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database.');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Tables found:', res.rows.map(row => row.table_name));

        client.release();
    } catch (err) {
        console.error('Connection failed:', err);
        import('fs').then(fs => fs.writeFileSync('db_error.txt', err.toString()));
    } finally {
        await pool.end();
    }
}

verifyConnection();
