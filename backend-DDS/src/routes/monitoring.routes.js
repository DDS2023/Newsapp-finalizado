import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        // Estadísticas resumidas
        const statsRes = await pool.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status >= 400 THEN 1 END) as error_count,
                AVG(duration) as avg_duration
            FROM RequestLog
        `);

        // Registros recientes
        const logsRes = await pool.query(`
            SELECT * FROM RequestLog ORDER BY id DESC LIMIT 20
        `);

        // Errores por día (histograma de últimos 7 días) - Bono opcional
        // manteniéndolo simple por ahora

        res.json({
            stats: statsRes.rows[0],
            logs: logsRes.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Descargar archivo de registro (opcional, "Acceso a bitácora")
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/logs/access', (req, res) => {
    const logPath = path.join(__dirname, '../../logs/access.log');
    res.download(logPath);
});

export default router;
