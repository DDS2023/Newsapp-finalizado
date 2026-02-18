import express from 'express';
import cors from 'cors';
import newsRoutes from './routes/news.routes.js';
import listRoutes from './routes/list.routes.js';
import authRoutes from './routes/auth.routes.js';
import alertRoutes from './routes/alert.routes.js';
import monitorRoutes from './routes/monitoring.routes.js';
import { monitorMiddleware } from './middleware/monitor.middleware.js';

const app = express();

// CONFIGURACIÓN CORS
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use(monitorMiddleware);

// RUTAS
app.use('/news', newsRoutes);
app.use('/lists', listRoutes);
app.use('/auth', authRoutes);
app.use('/alerts', alertRoutes);
app.use('/monitoring', monitorRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: 'Backend DDS funcionando' });
});

export default app;
