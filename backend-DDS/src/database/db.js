import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

console.log(`Conectando a PostgreSQL en ${process.env.DB_HOST}:${process.env.DB_PORT} como ${process.env.DB_USER}...`);

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

export const pool = new Pool(config);

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL exitosamente');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a PostgreSQL:', err);
});
