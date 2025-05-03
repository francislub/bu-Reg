"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

/**
 * Get course uploads for a specific user and semester
 */
export async function getCourseUploads(userId: string, semesterId: string) {
  try {
    const courseUploads = await db.courseUpload.findMany({
      where: {
        userId,
        semesterId,
      },
      include: {
        course: {
          include: {
            department: true,
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
    console.error("Error fetching course uploads:", error)
    return { success: false, message: "Failed to fetch course uploads", error: error.message }
  }
}

/**
 * Get all course uploads with filtering options
 */
export async function getAllCourseUploads({
  status,
  semesterId,
  userId,
  departmentId,
  page = 1,
  limit = 10,
}: {
  status?: string
  semesterId?: string
  userId?: string
  departmentId?: string
  page?: number
  limit?: number
}) {
  try {
    const skip = (page - 1) * limit

    // Build where clause based on filters
    const where: any = {}
    if (status) where.status = status
    if (semesterId) where.semesterId = semesterId
    if (userId) where.userId = userId
    if (departmentId) {
      where.course = {
        departmentId,
      }
    }

    // Get total count for pagination
    const totalCount = await db.courseUpload.count({ where })

    // Get course uploads
    const courseUploads = await db.courseUpload.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    return {
      success: true,
      courseUploads,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    }
  } catch (error) {
    console.error("Error fetching course uploads:", error)
    return { success: false, message: "Failed to fetch course uploads", error: error.message }
  }
}

/**
 * Approve a course upload
 */
export async function approveCourseUpload(courseUploadId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if user is a registrar or admin
    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return { success: false, message: "Only registrars and admins can approve course uploads" }
    }

    // Get the course upload first to include user info
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
      include: {
        user: true,
        course: true,
        semester: true,
      },
    })

    if (!courseUpload) {
      return { success: false, message: "Course upload not found" }
    }

    // Update course upload status
    const updatedCourseUpload = await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
      include: {
        user: true,
        course: true,
        semester: true,
      },
    })

    // Send email notification to student
    try {
      if (courseUpload.user.email) {
        await sendEmail({
          to: courseUpload.user.email,
          subject: "Course Registration Approved",
          text: `Your registration for ${courseUpload.course.title} (${courseUpload.course.code}) in ${courseUpload.semester.name} has been approved.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Course Registration Approved</h2>
              <p>Good news! Your registration for the following course has been approved:</p>
              <ul>
                <li><strong>Course:</strong> ${courseUpload.course.title} (${courseUpload.course.code})</li>
                <li><strong>Semester:</strong> ${courseUpload.semester.name}</li>
                <li><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
              <p>You can view your approved courses in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/registration">registration dashboard</a>.</p>
            </div>
          `,
        })
      }
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError)
      // Continue with the process even if email fails
    }

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")
    revalidatePath("/dashboard/course-approvals")
    revalidatePath(`/dashboard/students/${courseUpload.userId}`)

    return { success: true, courseUpload: updatedCourseUpload }
  } catch (error) {
    console.error("Error approving course upload:", error)
    return { success: false, message: "Failed to approve course upload", error: error.message }
  }
}

/**
 * Reject a course upload
 */
export async function rejectCourseUpload(courseUploadId: string, rejectionReason: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if user is a registrar or admin
    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return { success: false, message: "Only registrars and admins can reject course uploads" }
    }

    // Get the course upload first to include user info
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
      include: {
        user: true,
        course: true,
        semester: true,
      },
    })

    if (!courseUpload) {
      return { success: false, message: "Course upload not found" }
    }

    // Update course upload status
    const updatedCourseUpload = await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "REJECTED",
        rejectionReason,
        rejectedAt: new Date(),
        rejectedById: session.user.id,
      },
      include: {
        user: true,
        course: true,
        semester: true,
      },
    })

    // Send email notification to student
    try {
      if (courseUpload.user.email) {
        await sendEmail({
          to: courseUpload.user.email,
          subject: "Course Registration Rejected",
          text: `Your registration for ${courseUpload.course.title} (${courseUpload.course.code}) in ${courseUpload.semester.name} has been rejected. Reason: ${rejectionReason}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Course Registration Rejected</h2>
              <p>We regret to inform you that your registration for the following course has been rejected:</p>
              <ul>
                <li><strong>Course:</strong> ${courseUpload.course.title} (${courseUpload.course.code})</li>
                <li><strong>Semester:</strong> ${courseUpload.semester.name}</li>
                <li><strong>Rejection Date:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
              <p><strong>Reason for rejection:</strong> ${rejectionReason}</p>
              <p>Please contact the registrar's office if you have any questions or need assistance.</p>
            </div>
          `,
        })
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError)
      // Continue with the process even if email fails
    }

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")
    revalidatePath("/dashboard/course-approvals")
    revalidatePath(`/dashboard/students/${courseUpload.userId}`)

    return { success: true, courseUpload: updatedCourseUpload }
  } catch (error) {
    console.error("Error rejecting course upload:", error)
    return { success: false, message: "Failed to reject course upload", error: error.message }
  }
}

/**
 * Get course upload statistics
 */
export async function getCourseUploadStats(semesterId?: string) {
  try {
    // Build where clause based on filters
    const where: any = {}
    if (semesterId) where.semesterId = semesterId

    // Get counts by status
    const statusCounts = await db.courseUpload.groupBy({
      by: ["status"],
      where,
      _count: {
        id: true,
      },
    })

    // Get counts by department
    const courseUploads = await db.courseUpload.findMany({
      where,
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Group by department
    const departmentCounts: Record<string, { name: string; count: number }> = {}
    courseUploads.forEach((cu) => {
      const deptId = cu.course.department.id
      const deptName = cu.course.department.name
      if (!departmentCounts[deptId]) {
        departmentCounts[deptId] = { name: deptName, count: 0 }
      }
      departmentCounts[deptId].count++
    })

    // Format status counts
    const statusStats = statusCounts.map((count) => ({
      status: count.status,
      count: count._count.id,
    }))

    // Format department counts
    const departmentStats = Object.values(departmentCounts)

    return {
      success: true,
      stats: {
        byStatus: statusStats,
        byDepartment: departmentStats,
        total: courseUploads.length,
      },
    }
  } catch (error) {
    console.error("Error fetching course upload statistics:", error)
    return { success: false, message: "Failed to fetch course upload statistics", error: error.message }
  }
}

/**
 * Bulk approve course uploads
 */
export async function bulkApproveCourseUploads(courseUploadIds: string[]) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    // Check if user is a registrar or admin
    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return { success: false, message: "Only registrars and admins can approve course uploads" }
    }

    // Update course upload status for all IDs
    const result = await db.courseUpload.updateMany({
      where: {
        id: {
          in: courseUploadIds,
        },
        status: "PENDING", // Only update pending uploads
      },
      data: {
        status: "APPROVED",
      },
    })

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/registration")
    revalidatePath("/dashboard/course-approvals")

    return { success: true, count: result.count }
  } catch (error) {
    console.error("Error bulk approving course uploads:", error)
    return { success: false, message: "Failed to bulk approve course uploads", error: error.message }
  }
}
