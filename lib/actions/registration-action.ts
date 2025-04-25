"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateRegistrationCardNumber } from "@/lib/utils"

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
        semester: true,
      },
    })

    return { success: true, registration }
  } catch (error) {
    console.error("Error fetching student registration:", error)
    return { success: false, message: "Failed to fetch student registration" }
  }
}

export async function registerForSemester(userId: string, semesterId: string) {
  try {
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
      return { success: true, registration: existingRegistration }
    }

    // Create new registration
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "PENDING",
      },
    })

    revalidatePath("/dashboard/registration")
    return { success: true, registration }
  } catch (error) {
    console.error("Error registering for semester:", error)
    return { success: false, message: "Failed to register for semester" }
  }
}

export async function approveRegistration(registrationId: string, approverId: string) {
  try {
    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: true,
      },
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
        status: "APPROVED",
      },
      include: {
        user: true,
        semester: true,
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
      const cardNumber = await generateRegistrationCardNumber(registration.user.id, registration.semester.id)

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
    revalidatePath("/dashboard/registration")

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

export async function rejectRegistration(registrationId: string, approverId: string, reason?: string) {
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
        rejectionReason: reason,
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

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${registration.userId}`)
    revalidatePath("/dashboard/registration")

    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return { success: false, message: "Failed to reject registration" }
  }
}

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

    return { success: true, registrationCard }
  } catch (error) {
    console.error("Error fetching registration card:", error)
    return { success: false, message: "Failed to fetch registration card" }
  }
}

export async function getSemesterRegistrations(semesterId: string) {
  try {
    const registrations = await db.registration.findMany({
      where: {
        semesterId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
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

    return { success: true, registrations }
  } catch (error) {
    console.error("Error fetching semester registrations:", error)
    return { success: false, message: "Failed to fetch semester registrations" }
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
