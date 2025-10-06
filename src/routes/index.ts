import { Router } from 'express';
import { authMiddleware } from '../middleware/authChecker';
import userRoutes from './user.routes';
import quoteRoutes from './quote.routes';
import bookingRoutes from './booking.routes';
import transactionRoutes from './transaction.routes';
import inquiryRoutes from './inquiry.routes';
import clientRoutes from './client.routes';
import agentRoutes from './agent.routes';
import referralRoutes from './referral.routes';
import ticketRoutes from './ticket.routes';
import taskRoutes from './task.routes';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';
import authRoutes from './authRoutes';

const router = Router();

// API routes


router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/quotes', quoteRoutes);
router.use('/bookings', bookingRoutes);
router.use('/transactions', transactionRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/agents', agentRoutes);
router.use('/referrals', referralRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tasks', taskRoutes);
router.use('/auth-options', authRoutes);


router.get('/org/list',async (req,res)=>{
  const session = await auth.api.getSession({
    headers: await fromNodeHeaders(req.headers),
  });
  console.log(session,"from org list")
  const data = await auth.api.listOrganizations({
    // This endpoint requires session cookies.
    headers: await fromNodeHeaders(req.headers),
  });

  res.json(data);
})
router.get('/org/list/all/:id',async (req,res)=>{
  try {
    const data = await auth.api.listMembers({
      headers: await fromNodeHeaders(req.headers),
      query: {
        organizationId: req.params.id,
        limit: 100,
        offset: 0,
       
    },
    });
    res.json(data);
  } catch (error) {
    console.log(error,"from org list all")
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Something went wrong',
    });
  }

})
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
      referrals: '/api/referrals',
      tickets: '/api/tickets',
      tasks: '/api/tasks',
      health: '/health'
    }
  });
});

export default router;
