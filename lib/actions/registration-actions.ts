"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

/**
 * Get student registration for a specific semester
 */
export async function getStudentRegistration(userId: string, semesterId: string) {
  try {
    const registration = await db.registration.findFirst({
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
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    })

    return { success: true, registration }
  } catch (error) {
    console.error("Error fetching student registration:", error)
    return { success: false, message: "Failed to fetch student registration", error: error.message }
  }
}

/**
 * Register for a semester
 */
export async function registerForSemester(userId: string, semesterId: string) {
  try {
    // Check if user already registered for this semester
    const existingRegistration = await db.registration.findFirst({
      where: {
        userId,
        semesterId,
      },
    })

    if (existingRegistration) {
      return { success: false, message: "You are already registered for this semester" }
    }

    // Create new registration
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "DRAFT",
      },
      include: {
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
      },
    })

    revalidatePath("/dashboard/registration")
    return { success: true, registration }
  } catch (error) {
    console.error("Error registering for semester:", error)
    return { success: false, message: "Failed to register for semester", error: error.message }
  }
}

/**
 * Add course to registration
 */
export async function addCourseToRegistration(registrationId: string, courseId: string) {
  try {
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

    // Check if course is already added
    const existingCourseUpload = registration.courseUploads.find((upload) => upload.courseId === courseId)

    if (existingCourseUpload) {
      return { success: false, message: "Course already added to registration" }
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

    revalidatePath("/dashboard/registration")
    return { success: true }
  } catch (error) {
    console.error("Error removing course from registration:", error)
    return { success: false, message: "Failed to remove course from registration", error: error.message }
  }
}

/**
 * Submit registration for approval
 */
export async function submitRegistration(registrationId: string) {
  try {
    // Get registration with course uploads
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        courseUploads: true,
        user: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Check if registration has courses
    if (registration.courseUploads.length === 0) {
      return { success: false, message: "Registration must have at least one course" }
    }

    // Update registration status
    const updatedRegistration = await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "PENDING",
      },
      include: {
        user: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    })

    // Notify registrar about new registration submission
    try {
      // Get registrar emails
      const registrars = await db.user.findMany({
        where: {
          role: "REGISTRAR",
        },
        select: {
          email: true,
        },
      })

      // Send notification to registrars
      for (const registrar of registrars) {
        if (registrar.email) {
          await sendEmail({
            to: registrar.email,
            subject: "New Registration Submission",
            text: `A new registration has been submitted by ${registration.user.name || registration.user.email} for ${registration.semester.name}. Please review it in the approvals dashboard.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Registration Submission</h2>
                <p>A new registration has been submitted and requires your review:</p>
                <ul>
                  <li><strong>Student:</strong> ${registration.user.name || registration.user.email}</li>
                  <li><strong>Semester:</strong> ${registration.semester.name}</li>
                  <li><strong>Courses:</strong> ${registration.courseUploads.length}</li>
                  <li><strong>Submission Date:</strong> ${new Date().toLocaleString()}</li>
                </ul>
                <p>Please review this registration in the <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/approvals">approvals dashboard</a>.</p>
              </div>
            `,
          })
        }
      }
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError)
      // Continue with the process even if email fails
    }

    revalidatePath("/dashboard/registration")
    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error submitting registration:", error)
    return { success: false, message: "Failed to submit registration", error: error.message }
  }
}

/**
 * Approve a registration
 */
export async function approveRegistration(registrationId: string, approverId?: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    // Get the registration first to include user info
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: true,
      },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Check if registration has courses
    if (registration.courseUploads.length === 0) {
      return { success: false, message: "Registration must have at least one course" }
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
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    })

    // Generate a unique card number
    const cardNumber = `REG-${registration.user.id.substring(0, 4)}-${registration.semester.id.substring(0, 4)}-${Date.now().toString().substring(9, 13)}`

    // Create registration card
    const registrationCard = await db.registrationCard.create({
      data: {
        userId: updatedRegistration.userId,
        semesterId: updatedRegistration.semesterId,
        cardNumber,
        issuedDate: new Date(),
      },
    })

    // Approve all pending course uploads for this registration
    await db.courseUpload.updateMany({
      where: {
        registrationId,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
      },
    })

    // Send email notification to student
    try {
      if (registration.user.email) {
        await sendEmail({
          to: registration.user.email,
          subject: "Registration Approved",
          text: `Your registration for ${registration.semester.name} has been approved. You can now print your registration card from the dashboard.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Registration Approved</h2>
              <p>Good news! Your registration for ${registration.semester.name} has been approved.</p>
              <p>Your registration card number is: <strong>${cardNumber}</strong></p>
              <p>You can now print your registration card from the <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/registration/card">dashboard</a>.</p>
              <p>If you have any questions, please contact the registrar's office.</p>
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
    revalidatePath(`/dashboard/students/${registration.userId}`)

    return {
      success: true,
      registration: updatedRegistration,
      registrationCard,
    }
  } catch (error) {
    console.error("Error approving registration:", error)
    return { success: false, message: "Failed to approve registration", error: error.message }
  }
}

/**
 * Reject a registration
 */
export async function rejectRegistration(
  registrationId: string,
  rejectionReason = "Registration rejected by registrar",
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    // Get the registration first to include user info
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
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
        status: "REJECTED",
        rejectionReason,
      },
      include: {
        user: true,
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    })

    // Reject all pending course uploads for this registration
    await db.courseUpload.updateMany({
      where: {
        registrationId,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
      },
    })

    // Send email notification to student
    try {
      if (registration.user.email) {
        await sendEmail({
          to: registration.user.email,
          subject: "Registration Rejected",
          text: `Your registration for ${registration.semester.name} has been rejected. Reason: ${rejectionReason}. Please contact the registrar's office for more information.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Registration Rejected</h2>
              <p>We regret to inform you that your registration for ${registration.semester.name} has been rejected.</p>
              <p><strong>Reason:</strong> ${rejectionReason}</p>
              <p>Please contact the registrar's office for more information and to discuss next steps.</p>
              <p>You can resubmit your registration after addressing the issues mentioned.</p>
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
    revalidatePath(`/dashboard/students/${registration.userId}`)

    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return { success: false, message: "Failed to reject registration", error: error.message }
  }
}

/**
 * Get registration card
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
        semester: {
          include: {
            academicYear: true,
          },
        },
      },
    })

    // Get registration and all courses regardless of approval status
    const registration = await db.registration.findFirst({
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
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
        registrationCard: true,
      },
    })

    // If registration card doesn't exist but registration does, return registration data anyway
    // This allows printing even before official approval
    if (!registrationCard && registration) {
      return {
        success: true,
        registrationCard: null,
        courses: registration.courseUploads || [],
        registration: registration,
      }
    }

    if (!registrationCard && !registration) {
      return { success: false, message: "Registration not found" }
    }

    // Get payment information if available
    const paymentInfo = await db.payment.findFirst({
      where: {
        userId,
        semesterId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      registrationCard,
      courses: registration?.courseUploads || [],
      registration: registration,
      paymentInfo: paymentInfo || null,
    }
  } catch (error) {
    console.error("Error fetching registration card:", error)
    return { success: false, message: "Failed to fetch registration card", error: error.message }
  }
}

/**
 * Get all pending registrations
 */
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
        semester: {
          include: {
            academicYear: true,
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

    return { success: true, registrations: pendingRegistrations }
  } catch (error) {
    console.error("Error fetching pending registrations:", error)
    return { success: false, message: "Failed to fetch pending registrations", error: error.message }
  }
}

/**
 * Get all registrations with filtering options
 */
export async function getAllRegistrations({
  status,
  semesterId,
  userId,
  page = 1,
  limit = 10,
}: {
  status?: string
  semesterId?: string
  userId?: string
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

    // Get total count for pagination
    const totalCount = await db.registration.count({ where })

    // Get registrations
    const registrations = await db.registration.findMany({
      where,
      include: {
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
        courseUploads: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    return {
      success: true,
      registrations,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    }
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return { success: false, message: "Failed to fetch registrations", error: error.message }
  }
}

/**
 * Get registration statistics
 */
export async function getRegistrationStats() {
  try {
    // Get counts by status
    const statusCounts = await db.registration.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    })

    // Get counts by semester
    const semesterCounts = await db.registration.groupBy({
      by: ["semesterId"],
      _count: {
        id: true,
      },
    })

    // Get semester details for the counts
    const semesters = await db.semester.findMany({
      where: {
        id: {
          in: semesterCounts.map((count) => count.semesterId),
        },
      },
      include: {
        academicYear: true,
      },
    })

    // Format semester counts with names
    const semesterStats = semesterCounts.map((count) => {
      const semester = semesters.find((s) => s.id === count.semesterId)
      return {
        semesterId: count.semesterId,
        semesterName: semester ? `${semester.academicYear.year} ${semester.name}` : "Unknown",
        count: count._count.id,
      }
    })

    // Format status counts
    const statusStats = statusCounts.map((count) => ({
      status: count.status,
      count: count._count.id,
    }))

    // Get recent registrations
    const recentRegistrations = await db.registration.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
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

    return {
      success: true,
      stats: {
        byStatus: statusStats,
        bySemester: semesterStats,
        recent: recentRegistrations,
      },
    }
  } catch (error) {
    console.error("Error fetching registration statistics:", error)
    return { success: false, message: "Failed to fetch registration statistics", error: error.message }
  }
}

/**
 * Cancel a registration
 */
export async function cancelRegistration(registrationId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" }
    }

    // Get the registration
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
      },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Check if user is authorized to cancel
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.id !== registration.userId) {
      return { success: false, message: "You are not authorized to cancel this registration" }
    }

    // Only allow canceling if status is DRAFT or PENDING
    if (registration.status !== "DRAFT" && registration.status !== "PENDING") {
      return { success: false, message: "Cannot cancel a registration that has been approved or rejected" }
    }

    // Update registration status
    const updatedRegistration = await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "CANCELLED",
      },
    })

    // Cancel all course uploads for this registration
    await db.courseUpload.updateMany({
      where: {
        registrationId,
      },
      data: {
        status: "CANCELLED",
      },
    })

    revalidatePath("/dashboard/registration")
    if (session.user.role === "ADMIN" || session.user.role === "REGISTRAR") {
      revalidatePath("/dashboard/approvals")
      revalidatePath(`/dashboard/students/${registration.userId}`)
    }

    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error canceling registration:", error)
    return { success: false, message: "Failed to cancel registration", error: error.message }
  }
}
