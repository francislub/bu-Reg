"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addCourseToRegistration(
  userId: string,
  semesterId: string,
  registrationId: string,
  courseId: string,
) {
  try {
    // Check if course is already registered
    const existingCourseUpload = await db.courseUpload.findFirst({
      where: {
        userId,
        semesterId,
        courseId,
      },
    })

    if (existingCourseUpload) {
      return { success: false, message: "You are already registered for this course" }
    }

    // Create course upload
    const courseUpload = await db.courseUpload.create({
      data: {
        registrationId,
        courseId,
        userId,
        semesterId,
        status: "PENDING",
      },
    })

    revalidatePath("/dashboard/registration")
    return { success: true, courseUpload }
  } catch (error) {
    console.error("Error adding course:", error)
    return { success: false, message: "Failed to add course" }
  }
}

export async function dropCourseFromRegistration(courseUploadId: string) {
  try {
    // Check if course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
    })

    if (!courseUpload) {
      return { success: false, message: "Course registration not found" }
    }

    // Check if course is already approved
    if (courseUpload.status === "APPROVED") {
      return { success: false, message: "Cannot drop an approved course. Please contact the registrar." }
    }

    // Delete course upload
    await db.courseUpload.delete({
      where: { id: courseUploadId },
    })

    revalidatePath("/dashboard/registration")
    return { success: true, message: "Course dropped successfully" }
  } catch (error) {
    console.error("Error dropping course:", error)
    return { success: false, message: "Failed to drop course" }
  }
}

export async function getAvailableCoursesForSemester(semesterId: string) {
  try {
    const semesterCourses = await db.semesterCourse.findMany({
      where: { semesterId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    return {
      success: true,
      courses: semesterCourses.map((sc) => sc.course),
    }
  } catch (error) {
    console.error("Error fetching available courses:", error)
    return { success: false, message: "Failed to fetch available courses" }
  }
}

export async function getStudentRegisteredCourses(userId: string, semesterId: string) {
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
    })

    return { success: true, courseUploads }
  } catch (error) {
    console.error("Error fetching registered courses:", error)
    return { success: false, message: "Failed to fetch registered courses" }
  }
}
