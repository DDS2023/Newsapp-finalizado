import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

// Asumiendo que el servidor está corriendo en localhost:3000
const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
const TEST_USER = {
    nombre: 'Test',
    apellido: 'User',
    email: `test_${Date.now()}@example.com`,
    dni: `DNI_${Date.now()}`,
    contrasena: 'password123',
    idiomaPreferido: ''
};

async function testFullFlow() {
    console.log('--- Starting End-to-End Backend Test ---');
    console.log('Target:', BASE_URL);


}

// importar app y escuchar localmente
import app from './app.js';
import { pool } from './database/db.js';

async function runTest() {
    console.log('Starting temporary server for testing...');
    const server = app.listen(0, async () => {
        const port = server.address().port;
        const url = `http://localhost:${port}`;
        console.log(`Test server running at ${url}`);

        try {
            // 1. Registro
            console.log('\n1. Registering new user...');
            const regRes = await axios.post(`${url}/auth/register`, TEST_USER);
            console.log('Registered User ID:', regRes.data.userId);

            // 2. Iniciar sesión
            console.log('\n2. Logging in...');
            const loginRes = await axios.post(`${url}/auth/login`, {
                email: TEST_USER.email,
                contrasena: TEST_USER.contrasena
            });
            const token = loginRes.data.token;
            console.log('Got Token:', token ? 'YES' : 'NO');
            const authHeader = { Authorization: `Bearer ${token}` };

            // 3. Actualizar idioma a 'es'
            console.log('\n3. Updating language to "es"...');
            await axios.put(`${url}/auth/profile`, { idiomaPreferido: 'es' }, { headers: authHeader });
            console.log('Profile updated.');

            // 4. Buscar noticias (Esperar resultados en 'es')
            console.log('\n4. Searching news (Expect Spanish)...');

            const esSearch = await axios.get(`${url}/news/search?q=tecnologia`, { headers: authHeader });
            console.log(`Found ${esSearch.data.length} articles.`);
            if (esSearch.data.length > 0) {
                console.log('First Title:', esSearch.data[0].title);
            }

            // 5. Actualizar idioma a 'en'
            console.log('\n5. Updating language to "en"...');
            await axios.put(`${url}/auth/profile`, { idiomaPreferido: 'en' }, { headers: authHeader });
            console.log('Profile updated.');

            // 6. Buscar noticias (Esperar resultados en 'en')
            console.log('\n6. Searching news (Expect English)...');
            const enSearch = await axios.get(`${url}/news/search?q=technology`, { headers: authHeader });
            console.log(`Found ${enSearch.data.length} articles.`);
            if (enSearch.data.length > 0) {
                console.log('First Title:', enSearch.data[0].title);
            }

        } catch (err) {
            console.error('Test FAILED:', err.response ? err.response.data : err.message);
            if (err.response) console.error('Status:', err.response.status);
        } finally {
            console.log('\nClosing server and database...');
            server.close();
            await pool.end();
            console.log('Done.');
        }
    });
}

runTest();
