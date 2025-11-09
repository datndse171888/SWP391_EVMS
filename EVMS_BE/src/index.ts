import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { router } from './routes/index.js';
import uploadRoutes from './routes/upload.js';
import { socketAuth } from './middleware/socketAuth.js';
import { setupChatSocket } from './socket/chatSocket.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', router);
app.use('/api/uploads', uploadRoutes);
app.get('/', (_req, res) => res.send('EVMS BE running'));

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: env.frontendUrl || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Apply authentication middleware to Socket.io
io.use(socketAuth);

// Setup chat socket handlers
setupChatSocket(io);

async function startServer(): Promise<void> {
  try {
    await connectDB();
    server.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
      console.log(`Socket.io server ready`);
    });
  } catch (error) {
    console.error('Không thể kết nối MongoDB:', error);
    process.exit(1);
  }
}

startServer();

// Đóng kết nối khi dừng ứng dụng
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
