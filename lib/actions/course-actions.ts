"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Get student courses
 */
export async function getStudentCourses(userId: string, semesterId?: string) {
  try {
    // Validate userId to prevent malformed ObjectID errors
    if (!userId || userId === "$[id]" || userId.includes("%")) {
      console.error("Invalid user ID provided:", userId)
      return { success: false, message: "Invalid user ID provided" }
    }

    const courseUploads = await db.courseUpload.findMany({
      where: {
        userId,
        semesterId: semesterId ? semesterId : undefined,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
    })

    return { success: true, courseUploads }
  } catch (error) {
    console.error("Error fetching student courses:", error)
    return { success: false, message: "Failed to fetch student courses" }
  }
}

export async function getAllCourses() {
  try {
    const courses = await db.course.findMany({
      include: {
        department: true,
      },
      orderBy: {
        code: "asc",
      },
    })

    return { success: true, courses }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { success: false, message: "Failed to fetch courses" }
  }
}

export async function getCourseById(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        department: true,
      },
    })

    if (!course) {
      return { success: false, message: "Course not found" }
    }

    return { success: true, course }
  } catch (error) {
    console.error("Error fetching course:", error)
    return { success: false, message: "Failed to fetch course" }
  }
}

export async function createCourse(data: {
  code: string
  title: string
  credits: number
  departmentId: string
  description?: string
}) {
  try {
    // Check if course with same code already exists
    const existingCourse = await db.course.findUnique({
      where: { code: data.code },
    })

    if (existingCourse) {
      return { success: false, message: "Course with this code already exists" }
    }

    const course = await db.course.create({
      data: {
        code: data.code,
        title: data.title,
        credits: data.credits,
        departmentId: data.departmentId,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/courses")
    return { success: true, course }
  } catch (error) {
    console.error("Error creating course:", error)
    return { success: false, message: "Failed to create course" }
  }
}

export async function updateCourse(
  courseId: string,
  data: {
    code: string
    title: string
    credits: number
    departmentId: string
    description?: string
  },
) {
  try {
    // Check if another course with same code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        code: data.code,
        NOT: {
          id: courseId,
        },
      },
    })

    if (existingCourse) {
      return { success: false, message: "Another course with this code already exists" }
    }

    const course = await db.course.update({
      where: { id: courseId },
      data: {
        code: data.code,
        title: data.title,
        credits: data.credits,
        departmentId: data.departmentId,
        description: data.description,
      },
    })

    revalidatePath("/dashboard/courses")
    return { success: true, course }
  } catch (error) {
    console.error("Error updating course:", error)
    return { success: false, message: "Failed to update course" }
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await db.course.delete({
      where: { id: courseId },
    })

    revalidatePath("/dashboard/courses")
    return { success: true, message: "Course deleted successfully" }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { success: false, message: "Failed to delete course" }
  }
}
