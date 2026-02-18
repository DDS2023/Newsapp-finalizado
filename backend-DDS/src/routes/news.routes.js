import express from 'express';
import { searchNewsByText } from '../application/NewsAppService.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { saveSearch } from '../database/search.repository.js';

const router = express.Router();

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    const userId = req.user.userId;

    // Obtener preferencias del usuario
    const { findUserById } = await import('../database/user.repository.js');
    const user = await findUserById(userId);
    const languages = user ? user.idiomaPreferido : null;

    const news = await searchNewsByText(query, languages);

    // Guardar la búsqueda si no dio resultados o siempre
    // MODIFICADO: Ya no guardamos automáticamente. El usuario debe hacerlo manual.
    // if (news.length === 0) {
    //   await saveSearch(query, userId);
    // }

    res.json(news);
  } catch (error) {
    console.error('ERROR REAL:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
