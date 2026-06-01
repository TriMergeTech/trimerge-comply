import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  logLevel: process.env.LOG_LEVEL || 'info',
  frontendUrl: process.env.FRONTEND_URL,
  enableViews: process.env.ENABLE_VIEWS === 'true',
}));
