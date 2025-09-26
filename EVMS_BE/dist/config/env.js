import dotenv from 'dotenv';
export function loadEnv() { dotenv.config(); }
export const env = { port: Number(process.env.PORT) || 4000, nodeEnv: process.env.NODE_ENV || 'development' };
