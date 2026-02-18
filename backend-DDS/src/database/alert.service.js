import { getActiveSearches } from './search.repository.js';
import { searchNews } from '../infrastructure/NewsApiClient.js';
import { createAlert } from './alert.repository.js';
import { pool } from './db.js';
import { sendEmail } from '../infrastructure/EmailService.js';

export async function checkAlerts() {
  console.log('Verificando alertas...');
  const searches = await getActiveSearches();

  for (const search of searches) {
    try {
      console.log(`Checking search: ${search.cadena} (Last checked: ${search.lastcheckedat})`);
      // Search news
      const news = await searchNews(search.cadena);

      // Filter news strictly newer than last check, or just newer than 1 hour if first time
      const lastCheck = search.lastcheckedat ? new Date(search.lastcheckedat) : new Date(Date.now() - 3600000); // 1 hour ago default

      // NewsApiClient usually returns recent news. We can check publishedAt.
      const newItems = news.filter(n => new Date(n.publishedAt || n.fecha) > lastCheck);

      if (newItems.length > 0) {
        console.log(`Creating alert for search: ${search.cadena}`);
        const msg = `Se han encontrado ${newItems.length} nuevas noticias para tu búsqueda: "${search.cadena}"`;

        await createAlert(
          msg,
          search.id,
          search.userid
        );

        // Send Email
        if (search.email) {
          await sendEmail(search.email, 'Nueva Alerta de Noticias', msg);
        }
      }

      // Update lastCheckedAt
      await pool.query('UPDATE Search SET lastCheckedAt = NOW() WHERE id = $1', [search.id]);

    } catch (err) {
      console.error(`Error checking search ${search.id}:`, err);
    }
  }
}