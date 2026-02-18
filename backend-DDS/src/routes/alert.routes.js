import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getAlertsForUser, markAlertAsRead } from '../database/alert.repository.js';
import { checkAlerts } from '../database/alert.service.js';
import { saveSearch, getSearchesByUser, deactivateSearch } from '../database/search.repository.js';

const router = express.Router();


// Crear una nueva alerta (guardar búsqueda)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.userId;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Guardamos la búsqueda como activa para futuras alertas
    await saveSearch(query, userId);

    res.json({ message: `Alerta creada para "${query}"`, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener alertas del usuario
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const alerts = await getAlertsForUser(userId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar alerta como leída
router.put('/:alertId/read', authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    await markAlertAsRead(alertId);
    res.json({ message: 'Alerta marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forzar verificación de alertas (para pruebas)
router.post('/check', authenticateToken, async (req, res) => {
  try {
    await checkAlerts();
    res.json({ message: 'Verificación de alertas ejecutada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener suscripciones activas (búsquedas guardadas)
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const scans = await getSearchesByUser(userId);
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar (desactivar) una suscripción
router.delete('/subscriptions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await deactivateSearch(id);
    res.json({ message: 'Suscripción eliminada', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;