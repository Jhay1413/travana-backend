import { Router } from 'express';
import { authMiddleware } from '../middleware/authChecker';
import userRoutes from './user.routes';
import quoteRoutes from './quote.routes';
import bookingRoutes from './booking.routes';
import transactionRoutes from './transaction.routes';
import inquiryRoutes from './inquiry.routes';
import clientRoutes from './client.routes';
import agentRoutes from './agent.routes';

const router = Router();

// API routes
router.use('/users', authMiddleware, userRoutes);
router.use('/clients', clientRoutes);
router.use('/quotes', quoteRoutes);
router.use('/bookings', bookingRoutes);
router.use('/transactions', transactionRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/agents', agentRoutes);

// Default API route
router.get('/', (req, res) => {
  res.json({
    message: 'Travana Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      clients: '/api/clients',
      auth: '/api/auth',
      quotes: '/api/quotes',
      bookings: '/api/bookings',
      transactions: '/api/transactions',
      inquiries: '/api/inquiries',
      agents: '/api/agents',
      health: '/health'
    }
  });
});

export default router;
