import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton
 * 
 * Prevents multiple instances of Prisma Client in development
 * by reusing the same instance across hot reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

