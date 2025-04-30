"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function approveCourseUpload(courseUploadId: string) {
  try {
    // Find the course upload
    const courseUpload = await db.courseUpload.findUnique({
      where: {
        id: courseUploadId,
      },
      include: {
        registration: true,
      },
    })

    if (!courseUpload) {
      return {
        success: false,
        message: "Course upload not found",
      }
    }

    // Update the course upload status
    await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "APPROVED",
      },
    })

    // Check if all course uploads for this registration are approved
    const pendingUploads = await db.courseUpload.count({
      where: {
        registrationId: courseUpload.registrationId,
        status: "PENDING",
      },
    })

    // If no pending uploads, update the registration status
    if (pendingUploads === 0) {
      await db.registration.update({
        where: {
          id: courseUpload.registrationId,
        },
        data: {
          status: "APPROVED",
        },
      })
    }

    // Create a notification for the student
    await db.notification.create({
      data: {
        userId: courseUpload.registration.userId,
        title: "Course Approved",
        message: "Your course registration has been approved.",
        type: "COURSE_APPROVAL",
      },
    })

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")

    return {
      success: true,
      message: "Course upload approved successfully",
    }
  } catch (error) {
    console.error("Error approving course upload:", error)
    return {
      success: false,
      message: "Failed to approve course upload",
    }
  }
}

export async function rejectCourseUpload(courseUploadId: string, reason: string) {
  try {
    // Find the course upload
    const courseUpload = await db.courseUpload.findUnique({
      where: {
        id: courseUploadId,
      },
      include: {
        registration: true,
        course: true,
      },
    })

    if (!courseUpload) {
      return {
        success: false,
        message: "Course upload not found",
      }
    }

    // Update the course upload status
    await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    })

    // Create a notification for the student
    await db.notification.create({
      data: {
        userId: courseUpload.registration.userId,
        title: "Course Rejected",
        message: `Your course registration for ${courseUpload.course.name} has been rejected. Reason: ${reason}`,
        type: "COURSE_REJECTION",
      },
    })

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")

    return {
      success: true,
      message: "Course upload rejected successfully",
    }
  } catch (error) {
    console.error("Error rejecting course upload:", error)
    return {
      success: false,
      message: "Failed to reject course upload",
    }
  }
}
