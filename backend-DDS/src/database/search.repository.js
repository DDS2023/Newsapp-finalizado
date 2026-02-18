import { pool } from './db.js';

export async function saveSearch(cadena, userId) {
  const result = await pool.query(
    `INSERT INTO Search (fechaBusqueda, cadena, activa, userId) VALUES (NOW(), $1, true, $2) RETURNING id`,
    [cadena, userId]
  );
  return result.rows[0];
}

export async function getActiveSearches() {
  const result = await pool.query(`
    SELECT s.*, u.email 
    FROM Search s 
    JOIN "User" u ON s.userId = u.id 
    WHERE s.activa = true
  `);
  return result.rows;
}

export async function deactivateSearch(searchId) {
  await pool.query(`UPDATE Search SET activa = false WHERE id = $1`, [searchId]);
}

export async function getSearchesByUser(userId) {
  const result = await pool.query(`
    SELECT * FROM Search 
    WHERE userId = $1 AND activa = true
    ORDER BY fechaBusqueda DESC
  `, [userId]);
  return result.rows;
}