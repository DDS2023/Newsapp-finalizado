import { pool } from './db.js';

export async function createAlert(mensaje, searchId, userId) {
  await pool.query(
    `INSERT INTO Alert (mensaje, fecha, leida, searchId, userId) VALUES ($1, NOW(), false, $2, $3)`,
    [mensaje, searchId, userId]
  );
}

export async function getAlertsForUser(userId) {
  const result = await pool.query(
    `SELECT a.* FROM Alert a JOIN Search s ON a.searchId = s.id WHERE s.userId = $1 ORDER BY a.fecha DESC`,
    [userId]
  );
  return result.rows;
}

export async function markAlertAsRead(alertId) {
  await pool.query(`UPDATE Alert SET leida = true WHERE id = $1`, [alertId]);
}