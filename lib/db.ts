import { PrismaClient } from "@prisma/client"

// Add better error handling and connection management
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Add connection pooling settings
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection timeout settings
    connectionTimeout: 20000, // 20 seconds
  })

// Handle connection errors
db.$on("error", (e) => {
  console.error("Prisma Client error:", e)
})

// Add connection retry logic
db.$connect()
  .then(() => {
    console.log("Database connected successfully")
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err)
    // Implement retry logic if needed
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
