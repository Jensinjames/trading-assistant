import { PrismaClient } from '@prisma/client';

// Global declaration to make TypeScript happy
declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

// Check if we need to create a new Prisma client or use the existing one
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
} else {
  // In development, use a global variable to avoid multiple instances
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.cachedPrisma;
}

export { prisma };