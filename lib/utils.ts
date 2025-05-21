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

// Generate a unique registration card number in the format YEAR/BU/COURSE/NUMBER
export async function generateRegistrationCardNumber(userId: string, semesterId: string): Promise<string> {
  try {
    // Get current year (last 2 digits)
    const currentYear = new Date().getFullYear().toString().slice(-2)

    // University code is fixed as "BU"
    const universityCode = "BU"

    // Try to get the user's program/department information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        department: true,
      },
    })

    // Default course code if we can't determine it
    let courseCode = "GEN"

    // Try to extract course code from department or program
    if (user?.department?.code) {
      courseCode = user.department.code
    } else if (user?.profile?.program) {
      // Extract abbreviation from program name (e.g., "Bachelor of Science in Engineering" -> "BSE")
      const programWords = user.profile.program.split(" ")
      if (programWords.length > 0) {
        // Try to create an abbreviation from the program name
        courseCode = programWords
          .filter((word) => word.length > 2 && !["and", "the", "of", "in"].includes(word.toLowerCase()))
          .map((word) => word[0])
          .join("")
          .toUpperCase()

        // If we couldn't create a meaningful abbreviation, use the first 3 letters of the program
        if (!courseCode || courseCode.length < 2) {
          courseCode = user.profile.program.substring(0, 3).toUpperCase()
        }
      }
    }

    // Get the count of existing registration cards and add 1
    const count = await prisma.registrationCard.count()

    // Format as 4-digit number with leading zeros
    const sequentialNumber = String(count + 1).padStart(4, "0")

    // Combine all parts to create the card number
    return `${currentYear}/${universityCode}/${courseCode}/${sequentialNumber}`
  } catch (error) {
    console.error("Error generating registration card number:", error)
    // Fallback to a simple format if there's an error
    const currentYear = new Date().getFullYear().toString().slice(-2)
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    return `${currentYear}/BU/GEN/${randomDigits}`
  }
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
