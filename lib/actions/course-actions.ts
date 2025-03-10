"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendNotification } from "@/lib/notifications"

export async function createCourse(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const courseCode = formData.get("courseCode") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const credits = Number.parseInt(formData.get("credits") as string)
  const semester = formData.get("semester") as string
  const academicYear = formData.get("academicYear") as string
  const maxStudents = Number.parseInt(formData.get("maxStudents") as string)
  const facultyIds = (formData.get("facultyIds") as string).split(",")
  const prerequisiteIds = ((formData.get("prerequisiteIds") as string) || "").split(",").filter(Boolean)

  try {
    // Check if course already exists
    const existingCourse = await prisma.course.findUnique({
      where: { courseCode },
    })

    if (existingCourse) {
      return { error: "Course with this code already exists" }
    }

    // Create course
    await prisma.course.create({
      data: {
        courseCode,
        title,
        description,
        credits,
        semester,
        academicYear,
        maxStudents,
        facultyIds,
        prerequisiteIds,
      },
    })

    // Notify faculty members
    for (const facultyId of facultyIds) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { user: true },
      })

      if (faculty) {
        await sendNotification(
          faculty.userId,
          "New Course Assignment",
          `You have been assigned to teach ${courseCode}: ${title}`,
        )
      }
    }

    revalidatePath("/dashboard/admin/courses")
    return { success: "Course created successfully" }
  } catch (error) {
    console.error("Create course error:", error)
    return { error: "Failed to create course" }
  }
}

export async function updateCourse(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const id = formData.get("id") as string
  const courseCode = formData.get("courseCode") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const credits = Number.parseInt(formData.get("credits") as string)
  const semester = formData.get("semester") as string
  const academicYear = formData.get("academicYear") as string
  const maxStudents = Number.parseInt(formData.get("maxStudents") as string)
  const isActive = formData.get("isActive") === "true"
  const facultyIds = (formData.get("facultyIds") as string).split(",")
  const prerequisiteIds = ((formData.get("prerequisiteIds") as string) || "").split(",").filter(Boolean)

  try {
    await prisma.course.update({
      where: { id },
      data: {
        courseCode,
        title,
        description,
        credits,
        semester,
        academicYear,
        maxStudents,
        isActive,
        facultyIds,
        prerequisiteIds,
      },
    })

    revalidatePath("/dashboard/admin/courses")
    return { success: "Course updated successfully" }
  } catch (error) {
    console.error("Update course error:", error)
    return { error: "Failed to update course" }
  }
}

export async function deleteCourse(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    // Check if course has registrations
    const registrations = await prisma.registration.findMany({
      where: { courseId: id },
    })

    if (registrations.length > 0) {
      return { error: "Cannot delete course with active registrations" }
    }

    await prisma.course.delete({
      where: { id },
    })

    revalidatePath("/dashboard/admin/courses")
    return { success: "Course deleted successfully" }
  } catch (error) {
    console.error("Delete course error:", error)
    return { error: "Failed to delete course" }
  }
}

export async function registerForCourse(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    return { error: "Unauthorized" }
  }

  const courseId = formData.get("courseId") as string
  const semester = formData.get("semester") as string
  const academicYear = formData.get("academicYear") as string

  try {
    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { prerequisites: true },
    })

    if (!course) {
      return { error: "Course not found" }
    }

    // Check if course is active
    if (!course.isActive) {
      return { error: "Course is not active for registration" }
    }

    // Check if course is full
    if (course.currentStudents >= course.maxStudents) {
      return { error: "Course is full" }
    }

    // Check if student is already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        semester,
        academicYear,
      },
    })

    if (existingRegistration) {
      return { error: "You are already registered for this course" }
    }

    // Check prerequisites
    if (course.prerequisiteIds.length > 0) {
      // Get student's academic history
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id },
        include: { academicHistory: true },
      })

      if (!student) {
        return { error: "Student profile not found" }
      }

      // Check if student has completed all prerequisites
      for (const prerequisiteId of course.prerequisiteIds) {
        const prerequisite = await prisma.course.findUnique({
          where: { id: prerequisiteId },
        })

        if (!prerequisite) continue

        const completed = student.academicHistory.some((history) => history.courseCode === prerequisite.courseCode)

        if (!completed) {
          return { error: `Prerequisite ${prerequisite.courseCode}: ${prerequisite.title} not completed` }
        }
      }
    }

    // Check semester course limit (max 6 courses per semester)
    const semesterRegistrations = await prisma.registration.count({
      where: {
        userId: session.user.id,
        semester,
        academicYear,
      },
    })

    if (semesterRegistrations >= 6) {
      return { error: "Maximum course limit reached for this semester" }
    }

    // Create registration
    await prisma.registration.create({
      data: {
        userId: session.user.id,
        courseId,
        semester,
        academicYear,
        status: "PENDING",
      },
    })

    // Update course count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        currentStudents: { increment: 1 },
      },
    })

    // Notify student
    await sendNotification(
      session.user.id,
      "Course Registration Pending",
      `Your registration for ${course.courseCode}: ${course.title} is pending approval`,
    )

    revalidatePath("/dashboard/student/courses")
    return { success: "Course registration submitted successfully" }
  } catch (error) {
    console.error("Course registration error:", error)
    return { error: "Failed to register for course" }
  }
}

export async function approveRegistration(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { user: true, course: true },
    })

    if (!registration) {
      return { error: "Registration not found" }
    }

    await prisma.registration.update({
      where: { id },
      data: { status: "APPROVED" },
    })

    // Notify student
    await sendNotification(
      registration.userId,
      "Course Registration Approved",
      `Your registration for ${registration.course.courseCode}: ${registration.course.title} has been approved`,
    )

    revalidatePath("/dashboard/admin/registrations")
    return { success: "Registration approved successfully" }
  } catch (error) {
    console.error("Approve registration error:", error)
    return { error: "Failed to approve registration" }
  }
}

export async function rejectRegistration(id: string, reason: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { user: true, course: true },
    })

    if (!registration) {
      return { error: "Registration not found" }
    }

    await prisma.registration.update({
      where: { id },
      data: { status: "REJECTED" },
    })

    // Update course count
    await prisma.course.update({
      where: { id: registration.courseId },
      data: {
        currentStudents: { decrement: 1 },
      },
    })

    // Notify student
    await sendNotification(
      registration.userId,
      "Course Registration Rejected",
      `Your registration for ${registration.course.courseCode}: ${registration.course.title} has been rejected. Reason: ${reason}`,
    )

    revalidatePath("/dashboard/admin/registrations")
    return { success: "Registration rejected successfully" }
  } catch (error) {
    console.error("Reject registration error:", error)
    return { error: "Failed to reject registration" }
  }
}

