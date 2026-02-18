import { pool } from './db.js';

export async function createList(nombre, userId, parentId = null) {
  const result = await pool.query(
    `INSERT INTO Lista (nombre, userId, parentId) VALUES ($1, $2, $3) RETURNING id`,
    [nombre, userId, parentId]
  );

  return result.rows[0];
}

export async function getListsByUser(userId) {
  const result = await pool.query(
    `SELECT id, nombre, parentId FROM Lista WHERE userId = $1 ORDER BY parentId NULLS FIRST, nombre`,
    [userId]
  );
  return result.rows;
}

export async function getListByIdAndUser(listId, userId) {
  const result = await pool.query(
    `SELECT * FROM Lista WHERE id = $1 AND userId = $2`,
    [listId, userId]
  );
  return result.rows[0];
}
