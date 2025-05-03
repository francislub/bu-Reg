"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Add course to registration
 */
export async function addCourseToRegistration(registrationId: string, courseId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        courseUploads: true,
      },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Check if user is authorized
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.id !== registration.userId) {
      return { success: false, message: "You are not authorized to modify this registration" }
    }

    // Check if course is already added
    const existingCourseUpload = registration.courseUploads.find((upload) => upload.courseId === courseId)

    if (existingCourseUpload) {
      return { success: false, message: "Course already added to registration" }
    }

    // Get course details to verify it's valid
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
      },
    })

    if (!course) {
      return { success: false, message: "Course not found" }
    }

    // Get student's program to verify course is valid for their program
    if (session.user.role === "STUDENT") {
      const userProfile = await db.profile.findFirst({
        where: {
          user: {
            id: session.user.id,
          },
        },
      })

      if (userProfile?.programId) {
        // Check if course is part of student's program
        const programCourse = await db.programCourse.findFirst({
          where: {
            programId: userProfile.programId,
            courseId,
          },
        })

        if (!programCourse) {
          return {
            success: false,
            message: "This course is not part of your program",
          }
        }
      }
    }

    // Add course to registration
    const courseUpload = await db.courseUpload.create({
      data: {
        registrationId,
        courseId,
        userId: registration.userId,
        semesterId: registration.semesterId,
        status: "PENDING",
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Update registration status if it was previously empty
    if (registration.courseUploads.length === 0) {
      await db.registration.update({
        where: { id: registrationId },
        data: {
          updatedAt: new Date(),
        },
      })
    }

    revalidatePath("/dashboard/registration")
    return { success: true, courseUpload }
  } catch (error) {
    console.error("Error adding course to registration:", error)
    return { success: false, message: "Failed to add course to registration", error: error.message }
  }
}

/**
 * Remove course from registration
 */
export async function removeCourseFromRegistration(courseUploadId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
      include: {
        registration: true,
      },
    })

    if (!courseUpload) {
      return { success: false, message: "Course upload not found" }
    }

    // Check if user is authorized
    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "REGISTRAR" &&
      session.user.id !== courseUpload.registration.userId
    ) {
      return { success: false, message: "You are not authorized to modify this registration" }
    }

    // Only allow removing courses if registration is in DRAFT status
    if (courseUpload.registration.status !== "DRAFT") {
      return {
        success: false,
        message: "Cannot remove course from a registration that has been submitted",
      }
    }

    // Remove course from registration
    await db.courseUpload.delete({
      where: { id: courseUploadId },
    })

    // Update registration timestamp
    await db.registration.update({
      where: { id: courseUpload.registrationId },
      data: {
        updatedAt: new Date(),
      },
    })

    revalidatePath("/dashboard/registration")
    return { success: true }
  } catch (error) {
    console.error("Error removing course from registration:", error)
    return { success: false, message: "Failed to remove course from registration", error: error.message }
  }
}

export async function approveCourseRegistration(registrationId: string, approverId: string) {
  try {
    // Find the registration
    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
    })

    if (!registration) {
      return {
        success: false,
        message: "Registration not found",
      }
    }

    // Update the registration status
    await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        approvedAt: new Date(),
      },
    })

    // Also approve all course uploads for this registration
    await db.courseUpload.updateMany({
      where: {
        registrationId: registrationId,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
      },
    })

    // Create a notification for the student
    await db.notification.create({
      data: {
        userId: registration.userId,
        title: "Registration Approved",
        message: "Your course registration has been approved.",
        type: "REGISTRATION_APPROVAL",
      },
    })

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")

    return {
      success: true,
      message: "Registration approved successfully",
    }
  } catch (error) {
    console.error("Error approving registration:", error)
    return {
      success: false,
      message: "Failed to approve registration",
    }
  }
}

export async function rejectCourseRegistration(registrationId: string, approverId: string) {
  try {
    // Find the registration
    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
    })

    if (!registration) {
      return {
        success: false,
        message: "Registration not found",
      }
    }

    // Update the registration status
    await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "REJECTED",
        approvedById: approverId,
        approvedAt: new Date(),
      },
    })

    // Also reject all course uploads for this registration
    await db.courseUpload.updateMany({
      where: {
        registrationId: registrationId,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    })

    // Create a notification for the student
    await db.notification.create({
      data: {
        userId: registration.userId,
        title: "Registration Rejected",
        message: "Your course registration has been rejected.",
        type: "REGISTRATION_REJECTION",
      },
    })

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")

    return {
      success: true,
      message: "Registration rejected successfully",
    }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return {
      success: false,
      message: "Failed to reject registration",
    }
  }
}

/**
 * Get course registration details
 */
export async function getCourseRegistrationDetails(courseUploadId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        registration: true,
      },
    })

    if (!courseUpload) {
      return { success: false, message: "Course registration not found" }
    }

    // Check if user is authorized
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.id !== courseUpload.userId) {
      return { success: false, message: "You are not authorized to view this course registration" }
    }

    return { success: true, courseUpload }
  } catch (error) {
    console.error("Error fetching course registration details:", error)
    return { success: false, message: "Failed to fetch course registration details", error: error.message }
  }
}

/**
 * Get all course registrations for a student
 */
export async function getStudentCourseRegistrations(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if user is authorized
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return { success: false, message: "You are not authorized to view these course registrations" }
    }

    const courseUploads = await db.courseUpload.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        registration: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, courseUploads }
  } catch (error) {
    console.error("Error fetching student course registrations:", error)
    return { success: false, message: "Failed to fetch student course registrations", error: error.message }
  }
}

export async function dropCourseFromRegistration(courseUploadId: string) {
  try {
    // Check if the course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
      include: {
        registration: true,
      },
    })

    if (!courseUpload) {
      return { success: false, message: "Course registration not found" }
    }

    // Check if the registration is in a state where courses can be dropped
    if (courseUpload.registration.status !== "DRAFT" && courseUpload.registration.status !== "PENDING") {
      return {
        success: false,
        message: "Cannot drop courses from a registration that has already been approved or rejected",
      }
    }

    // Delete the course upload
    await db.courseUpload.delete({
      where: { id: courseUploadId },
    })

    // Revalidate paths
    revalidatePath("/dashboard/registration")
    revalidatePath(`/dashboard/students/${courseUpload.registration.userId}`)

    return { success: true }
  } catch (error) {
    console.error("Error dropping course from registration:", error)
    return { success: false, message: "Failed to drop course from registration" }
  }
}
