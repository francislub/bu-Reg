"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateRegistrationCardNumber } from "@/lib/utils"

/**
 * Get student registration for a specific semester
 */
export async function getStudentRegistration(userId: string, semesterId: string) {
  try {
    const registration = await db.registration.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
      include: {
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    })

    return { success: true, registration }
  } catch (error) {
    console.error("Error fetching student registration:", error)
    return { success: false, message: "Failed to fetch student registration" }
  }
}

/**
 * Register a student for a semester
 */
export async function registerForSemester(userId: string, semesterId: string) {
  try {
    // Check if userId and semesterId are valid
    if (!userId || !semesterId) {
      return { success: false, message: "Invalid user ID or semester ID provided" }
    }

    // Check if registration already exists
    const existingRegistration = await db.registration.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
    })

    if (existingRegistration) {
      return { success: false, message: "You are already registered for this semester" }
    }

    // Create new registration without registrationDate field
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "PENDING",
        // Remove registrationDate as it's not in the schema
      },
      include: {
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/registration")

    return { success: true, registration }
  } catch (error) {
    console.error("Error registering for semester:", error)
    return { success: false, message: "Failed to register for semester" }
  }
}

/**
 * Get registration card for a student in a specific semester
 */
export async function getRegistrationCard(userId: string, semesterId: string) {
  try {
    const registrationCard = await db.registrationCard.findFirst({
      where: {
        userId,
        semesterId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: true,
      },
    })

    if (!registrationCard) {
      return { success: false, message: "Registration card not found" }
    }

    return { success: true, registrationCard }
  } catch (error) {
    console.error("Error fetching registration card:", error)
    return { success: false, message: "Failed to fetch registration card" }
  }
}

/**
 * Approve a registration
 */
export async function approveRegistration(registrationId: string) {
  try {
    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Update registration status - fix the syntax and remove approvedAt which isn't in the schema
    const updatedRegistration = await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "APPROVED",
        // Remove approvedById and approvedAt if they're not in your schema
      },
    })

    // Generate registration card if it doesn't exist
    let registrationCard = await db.registrationCard.findFirst({
      where: {
        userId: registration.userId,
        semesterId: registration.semesterId,
      },
    })

    if (!registrationCard) {
      const cardNumber = await generateRegistrationCardNumber(registration.userId, registration.semesterId)

      registrationCard = await db.registrationCard.create({
        data: {
          userId: registration.userId,
          semesterId: registration.semesterId,
          cardNumber,
          issuedDate: new Date(),
        },
      })
    }

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${registration.userId}`)

    return {
      success: true,
      registration: updatedRegistration,
      registrationCard,
    }
  } catch (error) {
    console.error("Error approving registration:", error)
    return { success: false, message: "Failed to approve registration" }
  }
}

/**
 * Reject a registration
 */
export async function rejectRegistration(registrationId: string, rejectionReason: string) {
  try {
    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Update registration status
    const updatedRegistration = await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason || "No reason provided",
        // Remove approvedById and approvedAt if they're not in your schema
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${registration.userId}`)

    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return { success: false, message: "Failed to reject registration" }
  }
}

export async function getAllPendingRegistrations() {
  try {
    const pendingRegistrations = await db.registration.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: true,
        courseUploads: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return pendingRegistrations
  } catch (error) {
    console.error("Error fetching pending registrations:", error)
    throw error
  }
}
