import { PrismaClient } from "@prisma/client"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Add error handling and logging to Prisma initialization
let prisma: PrismaClient

try {
  console.log("Initializing Prisma client")
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ["query", "error", "warn"],
    })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
    console.log("Prisma client initialized successfully")
  }
} catch (error) {
  console.error("Failed to initialize Prisma client:", error)
  throw error
}

export default prisma

