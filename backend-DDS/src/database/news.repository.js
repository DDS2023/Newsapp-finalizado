import { pool } from './db.js';

export async function findOrCreateNews(titular, cuerpo, fecha, idioma, tema, url, fuente) {
  // Buscar si ya existe por URL (única)
  let result = await pool.query(`SELECT id FROM News WHERE url = $1`, [url]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // Insertar nueva
  result = await pool.query(
    `INSERT INTO News (titular, cuerpo, fecha, idioma, tema, url, fuente) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [titular, cuerpo, fecha, idioma, tema, url, fuente]
  );
  return result.rows[0];
}

export async function addNewsToList(listaId, newsId) {
  await pool.query(
    `INSERT INTO ListaNews (listaId, newsId) VALUES ($1, $2) ON CONFLICT (listaId, newsId) DO NOTHING`,
    [listaId, newsId]
  );
}

export async function markNewsAsRead(listaId, newsId) {
  await pool.query(
    `UPDATE ListaNews SET leida = TRUE WHERE listaId = $1 AND newsId = $2`,
    [listaId, newsId]
  );
}

export async function getNewsInListWithReadStatus(listId) {
  const result = await pool.query(
    `SELECT n.*, ln.leida FROM News n
     JOIN ListaNews ln ON n.id = ln.newsId
     WHERE ln.listaId = $1`,
    [listId]
  );
  return result.rows;
}