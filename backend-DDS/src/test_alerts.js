import { pool } from './database/db.js';
import { checkAlerts } from './database/alert.service.js';
import { saveSearch } from './database/search.repository.js';

// Ayudante para obtener un usuario
async function getUser() {
    const res = await pool.query('SELECT id FROM "User" LIMIT 1');
    return res.rows[0];
}

async function testAlerts() {
    console.log('--- Testing Alerts ---');
    try {
        const user = await getUser();
        if (!user) {
            console.error('No user found to test with.');
            return;
        }

        // 1. Crear una búsqueda activa (forzando que sea "antigua" para que nuevas noticias la disparen)
        console.log('Creating test search for "Bitcoin"...');
        const search = await saveSearch('Bitcoin', user.id);

        // Forzar lastCheckedAt a 24h atrás para asegurar que encontramos noticias "nuevas"
        await pool.query("UPDATE Search SET lastCheckedAt = NOW() - INTERVAL '24 hours' WHERE id = $1", [search.id]);

        // 2. Ejecutar verificación
        console.log('Running checkAlerts()...');
        await checkAlerts();

        // 3. Verificar alerta
        const alerts = await pool.query('SELECT * FROM Alert WHERE userId = $1 ORDER BY id DESC LIMIT 1', [user.id]);

        // Debug: Verificar si la búsqueda existe y está activa
        const sStatus = await pool.query('SELECT * FROM Search WHERE id = $1', [search.id]);
        console.log('Search Status:', sStatus.rows[0]);

        if (alerts.rows.length > 0) {
            console.log('SUCCESS: Alert created:', alerts.rows[0].mensaje);
        } else {
            console.log('FAILURE: No alert created.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await pool.end();
    }
}

testAlerts();
