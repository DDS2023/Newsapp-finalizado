
import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import app from './app.js';
import { checkAlerts } from './database/alert.service.js';

const PORT = 3000;

// Programar verificación cada hora
cron.schedule('0 * * * *', checkAlerts);

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`);
});
