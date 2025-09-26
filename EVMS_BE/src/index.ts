import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { router } from './routes/index.js';
try {
  await connectDB();
} catch (error) {
  console.error('Không thể kết nối MongoDB:', error);
  process.exit(1);
}
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', router);
app.get('/', (_req, res) => res.send('EVMS BE running'));
app.listen(env.port, () => { console.log('Server listening on port ' + env.port); });

// Đóng kết nối khi dừng ứng dụng
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
