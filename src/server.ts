import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const start = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL (Supabase)');

    app.listen(env.PORT, () => {
      console.log(`[Server] Running on http://localhost:${env.PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
