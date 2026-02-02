import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscription';
import scoreRoutes from './routes/scores';
import drawRoutes from './routes/draw';
import charityRoutes from './routes/charity';
import winnerRoutes from './routes/winner';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhook';
import contentRoutes from './routes/content';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhook route needs raw body (must be before express.json)
app.use('/api/webhook', webhookRoutes);

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draw', drawRoutes);
app.use('/api/charity', charityRoutes);
app.use('/api/winner', winnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Root route
app.get('/', (_req, res) => {
  res.send('Server is running 🚀');
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
