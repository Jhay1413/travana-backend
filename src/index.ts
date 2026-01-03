import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { authMiddleware } from './middleware/authChecker';
import routes from './routes';
import { createServer } from 'http';
import { initializeSocketServer } from './lib/socket-handler';
import { initializeTaskReminderCron } from './lib/task-reminder-cron';
import { initializeTicketReminderCron } from './lib/ticket-reminder-cron';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: [
    'https://www.travana.app',
    'http://localhost:4200',
    'http://localhost:5173',
    'https://travana-client.onrender.com',
    'https://travana-client-dev.onrender.com',
    'https://travana-referral.onrender.com',
    'https://referral-dev.travana.app',
    'https://www.referral-dev.travana.app',
    'https://dev-travana-client.travana.app',
    'https://www.dev-travana-client.travana.app',
    'https://www.prod-api.travana.app'
  ], // This is the origin of the client
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
};

app.use(cors(corsOptions));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const server = createServer(app);

// Initialize Socket.IO
initializeSocketServer(server);

// Initialize cron jobs
initializeTaskReminderCron();
initializeTicketReminderCron();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
