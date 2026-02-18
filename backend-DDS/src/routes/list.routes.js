import express from 'express';
import { createListService, getListsService } from '../application/ListAppService.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { findOrCreateNews, addNewsToList, markNewsAsRead, getNewsInListWithReadStatus } from '../database/news.repository.js';
import { getListByIdAndUser } from '../database/list.repository.js';

const router = express.Router();

// Crear lista (soporta parentId para jerarquía)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, parentId } = req.body;
    const userId = req.user.userId;

    const list = await createListService(nombre, userId, parentId);

    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener listas del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const lists = await getListsService(userId);
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar noticia a lista
router.post('/:listId/news', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.userId;
    const { titular, cuerpo, fecha, idioma, tema, url, fuente } = req.body;

    // Verificar que la lista pertenece al usuario
    const list = await getListByIdAndUser(listId, userId);
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    // Crear o encontrar noticia
    const news = await findOrCreateNews(titular, cuerpo, fecha, idioma, tema, url, fuente);

    // Agregar a lista
    await addNewsToList(listId, news.id);

    res.status(201).json({ message: 'Noticia agregada a la lista' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener noticias en lista con estado de lectura
router.get('/:listId/news', authenticateToken, async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.userId;

    // Verificar propiedad
    const list = await getListByIdAndUser(listId, userId);
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const news = await getNewsInListWithReadStatus(listId);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar noticia como leída
router.put('/:listId/news/:newsId/read', authenticateToken, async (req, res) => {
  try {
    const { listId, newsId } = req.params;
    const userId = req.user.userId;

    // Verificar propiedad de lista
    const list = await getListByIdAndUser(listId, userId);
    if (!list) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    await markNewsAsRead(listId, newsId);
    res.json({ message: 'Noticia marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
