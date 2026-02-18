
import { findUserById, findUserByEmail } from './src/database/user.repository.js';
import { pool } from './src/database/db.js';

async function check() {
    try {

        const res = await pool.query('SELECT * FROM "User" LIMIT 1');
        if (res.rows.length > 0) {
            console.log('User keys:', Object.keys(res.rows[0]));
            const user = await findUserById(res.rows[0].id);
            console.log('findUserById keys:', Object.keys(user));
            console.log('idiomaPreferido value:', user.idiomaPreferido);
            console.log('idiomapreferido value:', user.idiomapreferido);
        } else {
            console.log('No users found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
