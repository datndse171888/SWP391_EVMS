import dotenv from 'dotenv';
// Nạp biến môi trường ngay khi import module
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  dbName: process.env.DB_NAME || 'evms',
};
