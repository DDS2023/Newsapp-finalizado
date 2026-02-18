import { pool } from '../database/db.js';
import { logAccess, logError } from '../infrastructure/Logger.js';

export function monitorMiddleware(req, res, next) {
    const start = Date.now();

    // Enganchar en la finalización de la respuesta para calcular la duración
    res.on('finish', async () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;

        // 1. Registrar en archivo
        const msg = `${method} ${originalUrl} ${statusCode} ${duration}ms`;
        logAccess(msg);
        if (statusCode >= 400) {
            logError(`ERROR: ${msg}`);
        }

        // 2. Registrar en BD (Disparar y olvidar, no bloquear respuesta)
        try {
            await pool.query(
                `INSERT INTO RequestLog (method, url, status, duration) VALUES ($1, $2, $3, $4)`,
                [method, originalUrl, statusCode, duration]
            );
        } catch (err) {
            console.error('Failed to log to DB:', err);
        }
    });

    next();
}
