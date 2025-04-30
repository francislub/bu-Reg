"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

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
