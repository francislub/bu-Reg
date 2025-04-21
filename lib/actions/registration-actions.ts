"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function registerForSemester(userId: string, semesterId: string) {
  try {
    // Check if user is already registered for this semester
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

    // Create registration
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

export async function getStudentRegistration(userId: string, semesterId?: string) {
  try {
    const where = {
      userId,
      ...(semesterId ? { semesterId } : {}),
    }

    const registration = await db.registration.findFirst({
      where,
      include: {
        semester: true,
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
            approvals: {
              include: {
                approver: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!registration) {
      return { success: false, message: "No registration found" }
    }

    return { success: true, registration }
  } catch (error) {
    console.error("Error fetching student registration:", error)
    return { success: false, message: "Failed to fetch student registration" }
  }
}

export async function uploadCourses(registrationId: string, userId: string, semesterId: string, courseIds: string[]) {
  try {
    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Create course uploads
    const courseUploads = await Promise.all(
      courseIds.map(async (courseId) => {
        // Check if course is already uploaded
        const existingUpload = await db.courseUpload.findUnique({
          where: {
            registrationId_courseId: {
              registrationId,
              courseId,
            },
          },
        })

        if (existingUpload) {
          return existingUpload
        }

        return db.courseUpload.create({
          data: {
            registrationId,
            courseId,
            userId,
            semesterId,
            status: "PENDING",
          },
        })
      }),
    )

    revalidatePath("/dashboard/registration")
    return { success: true, courseUploads }
  } catch (error) {
    console.error("Error uploading courses:", error)
    return { success: false, message: "Failed to upload courses" }
  }
}

export async function removeCourseUpload(courseUploadId: string) {
  try {
    await db.courseUpload.delete({
      where: { id: courseUploadId },
    })

    revalidatePath("/dashboard/registration")
    return { success: true, message: "Course removed successfully" }
  } catch (error) {
    console.error("Error removing course upload:", error)
    return { success: false, message: "Failed to remove course" }
  }
}

export async function getPendingRegistrations() {
  try {
    const registrations = await db.registration.findMany({
      where: { status: "PENDING" },
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
    })

    return { success: true, registrations }
  } catch (error) {
    console.error("Error fetching pending registrations:", error)
    return { success: false, message: "Failed to fetch pending registrations" }
  }
}

export async function approveRegistration(registrationId: string) {
  try {
    const registration = await db.registration.update({
      where: { id: registrationId },
      data: { status: "APPROVED" },
      include: {
        user: true,
        semester: true,
      },
    })

    // Generate registration card
    const latestCard = await db.registrationCard.findFirst({
      orderBy: { cardNumber: "desc" },
    })

    let cardNumber = "BU" + new Date().getFullYear() + "-0001"
    if (latestCard) {
      const currentNumber = Number.parseInt(latestCard.cardNumber.split("-")[1])
      cardNumber = `BU${new Date().getFullYear()}-${(currentNumber + 1).toString().padStart(4, "0")}`
    }

    await db.registrationCard.create({
      data: {
        userId: registration.userId,
        semesterId: registration.semesterId,
        cardNumber,
      },
    })

    revalidatePath("/dashboard/approvals")
    return { success: true, registration }
  } catch (error) {
    console.error("Error approving registration:", error)
    return { success: false, message: "Failed to approve registration" }
  }
}

export async function rejectRegistration(registrationId: string) {
  try {
    const registration = await db.registration.update({
      where: { id: registrationId },
      data: { status: "REJECTED" },
    })

    revalidatePath("/dashboard/approvals")
    return { success: true, registration }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return { success: false, message: "Failed to reject registration" }
  }
}

export async function approveCourseUpload(courseUploadId: string, approverId: string, comments?: string) {
  try {
    // Update course upload status
    const courseUpload = await db.courseUpload.update({
      where: { id: courseUploadId },
      data: { status: "APPROVED" },
    })

    // Create approval record
    await db.courseApproval.create({
      data: {
        courseUploadId,
        approverId,
        status: "APPROVED",
        comments,
      },
    })

    revalidatePath("/dashboard/approvals")
    return { success: true, courseUpload }
  } catch (error) {
    console.error("Error approving course upload:", error)
    return { success: false, message: "Failed to approve course" }
  }
}

export async function rejectCourseUpload(courseUploadId: string, approverId: string, comments: string) {
  try {
    // Update course upload status
    const courseUpload = await db.courseUpload.update({
      where: { id: courseUploadId },
      data: { status: "REJECTED" },
    })

    // Create approval record
    await db.courseApproval.create({
      data: {
        courseUploadId,
        approverId,
        status: "REJECTED",
        comments,
      },
    })

    revalidatePath("/dashboard/approvals")
    return { success: true, courseUpload }
  } catch (error) {
    console.error("Error rejecting course upload:", error)
    return { success: false, message: "Failed to reject course" }
  }
}

export async function getRegistrationCard(userId: string, semesterId?: string) {
  try {
    const where = {
      userId,
      ...(semesterId ? { semesterId } : {}),
    }

    const registrationCard = await db.registrationCard.findFirst({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!registrationCard) {
      return { success: false, message: "No registration card found" }
    }

    return { success: true, registrationCard }
  } catch (error) {
    console.error("Error fetching registration card:", error)
    return { success: false, message: "Failed to fetch registration card" }
  }
}
