"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getStudentRegistrations(studentId: string) {
  try {
    const registrations = await db.courseRegistration.findMany({
      where: {
        studentId,
      },
      include: {
        course: true,
        semester: true,
      },
    })
    return { success: true, registrations }
  } catch (error) {
    console.error("Error fetching student registrations:", error)
    return { success: false, message: "Failed to fetch student registrations" }
  }
}

export async function getStudentApprovals(studentId: string) {
  try {
    const approvals = await db.courseRegistration.findMany({
      where: {
        studentId,
        status: "PENDING",
      },
      include: {
        course: true,
        semester: true,
      },
    })
    return { success: true, approvals }
  } catch (error) {
    console.error("Error fetching student approvals:", error)
    return { success: false, message: "Failed to fetch student approvals" }
  }
}

export async function getAllPendingRegistrations() {
  try {
    const pendingRegistrations = await db.courseRegistration.findMany({
      include: {
        student: {
          include: {
            profile: true,
          },
        },
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
        approvals: true,
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

export async function approveRegistration(registrationId: string, approverId: string) {
  try {
    // Check if registration exists
    const registration = await db.courseRegistration.findUnique({
      where: { id: registrationId },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Update registration status and create approval record
    const updatedRegistration = await db.courseRegistration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "APPROVED",
        approvals: {
          create: {
            status: "APPROVED",
            approverId: approverId,
          },
        },
      },
      include: {
        student: true,
        course: true,
        semester: true,
        approvals: true,
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${registration.studentId}`)

    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error approving registration:", error)
    return { success: false, message: "Failed to approve registration" }
  }
}

export async function rejectRegistration(registrationId: string, approverId: string) {
  try {
    // Check if registration exists
    const registration = await db.courseRegistration.findUnique({
      where: { id: registrationId },
    })

    if (!registration) {
      return { success: false, message: "Registration not found" }
    }

    // Update registration status and create approval record
    const updatedRegistration = await db.courseRegistration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "REJECTED",
        approvals: {
          create: {
            status: "REJECTED",
            approverId: approverId,
          },
        },
      },
      include: {
        student: true,
        course: true,
        semester: true,
        approvals: true,
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${registration.studentId}`)

    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return { success: false, message: "Failed to reject registration" }
  }
}

export async function registerForCourse(data: {
  studentId: string
  courseId: string
  semesterId: string
}) {
  try {
    // Check if registration already exists
    const existingRegistration = await db.courseRegistration.findFirst({
      where: {
        studentId: data.studentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
      },
    })

    if (existingRegistration) {
      return {
        success: false,
        message: "You have already registered for this course in this semester",
      }
    }

    // Create new registration
    const registration = await db.courseRegistration.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        status: "PENDING",
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/course-registration")
    revalidatePath("/dashboard/approvals")

    return { success: true, registration }
  } catch (error) {
    console.error("Error registering for course:", error)
    return { success: false, message: "Failed to register for course" }
  }
}
