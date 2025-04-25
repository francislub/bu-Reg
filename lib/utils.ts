import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateRegistrationCardNumber(userId: string, semesterId: string): Promise<string> {
  // Get current date
  const now = new Date()
  const year = now.getFullYear().toString()

  // Get last 4 characters of userId (MongoDB ObjectId)
  const userIdSuffix = userId.slice(-4)

  // Get last 4 characters of semesterId (MongoDB ObjectId)
  const semesterIdSuffix = semesterId.slice(-4)

  // Generate a random 4-digit number
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString()

  // Combine all parts to create a unique registration card number
  const cardNumber = `BU-${year}-${userIdSuffix}-${semesterIdSuffix}-${randomDigits}`

  return cardNumber
}

export function formatCreditHours(credits: number): string {
  return credits === 1 ? "1 Credit Hour" : `${credits} Credit Hours`
}

export function calculateTotalCredits(courses: Array<{ course: { credits: number } }>): number {
  return courses.reduce((total, item) => total + item.course.credits, 0)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "text-green-600 bg-green-50"
    case "PENDING":
      return "text-yellow-600 bg-yellow-50"
    case "REJECTED":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}
