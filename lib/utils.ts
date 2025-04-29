import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Format date and time to readable string
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

// Format credit hours with appropriate suffix
export function formatCreditHours(credits: number): string {
  return `${credits} credit${credits === 1 ? "" : "s"}`
}

// Generate a unique registration card number
export async function generateRegistrationCardNumber(userId: string, semesterId: string): Promise<string> {
  // Get current year
  const currentYear = new Date().getFullYear().toString().slice(-2)

  // Get semester info for semester code
  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
    include: { academicYear: true },
  })

  // Get user info for student number
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  // Generate a random 4-digit number
  const randomDigits = Math.floor(1000 + Math.random() * 9000)

  // Create card number format: BU-YEAR-SEM-STUDENTID-RANDOM
  // Example: BU-23-1-12345-7890
  const semesterCode = semester?.name.includes("1") ? "1" : "2"
  const studentIdShort = user?.id.slice(-5) || randomDigits.toString()

  return `BU-${currentYear}-${semesterCode}-${studentIdShort}-${randomDigits}`
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// Generate initials from name
export function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
