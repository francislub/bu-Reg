"use server"

import { db } from "@/lib/db"

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
    return registrations
  } catch (error) {
    console.error("Error fetching student registrations:", error)
    throw error
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
    return approvals
  } catch (error) {
    console.error("Error fetching student approvals:", error)
    throw error
  }
}

export async function getAllPendingRegistrations() {
  try {
    const pendingRegistrations = await db.courseRegistration.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        student: true,
        course: true,
        semester: true,
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
    })
    return { success: true, registration: updatedRegistration }
  } catch (error) {
    console.error("Error approving registration:", error)
    return { success: false, message: "Failed to approve registration" }
  }
}

export async function rejectRegistration(registrationId: string, approverId: string) {
  try {
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
    })
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
    const registration = await db.courseRegistration.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        semesterId: data.semesterId,
        status: "PENDING",
      },
    })
    return registration
  } catch (error) {
    console.error("Error registering for course:", error)
    throw error
  }
}
