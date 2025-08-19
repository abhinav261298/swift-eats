import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'food_user',
  password: process.env.DB_PASSWORD || 'food_password',
  name: process.env.DB_NAME || 'food_delivery',
  url: process.env.DATABASE_URL,
}));
