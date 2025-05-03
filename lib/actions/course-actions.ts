"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Get all courses
 */
export async function getAllCourses() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, message: "Unauthorized" }
    }

    let courses = []

    // If user is a student, get courses based on their program
    if (session.user.role === "STUDENT") {
      // Get student profile to determine program
      const userProfile = await db.profile.findFirst({
        where: {
          user: {
            id: session.user.id,
          },
        },
      })

      if (userProfile?.programId) {
        // Get courses for this program
        courses = await db.course.findMany({
          where: {
            programCourses: {
              some: {
                programId: userProfile.programId,
              },
            },
          },
          include: {
            department: true,
          },
          orderBy: {
            code: "asc",
          },
        })
      } else {
        // If student has no program assigned, return empty list
        courses = []
      }
    } else {
      // For admin/registrar/staff, show all courses
      courses = await db.course.findMany({
        include: {
          department: true,
        },
        orderBy: {
          code: "asc",
        },
      })
    }

    return { success: true, courses }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { success: false, message: "Failed to fetch courses", error: error.message }
  }
}

/**
 * Get course by ID
 */
export async function getCourseById(id: string) {
  try {
    const course = await db.course.findUnique({
      where: { id },
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
    return { success: false, message: "Failed to fetch course", error: error.message }
  }
}

/**
 * Create or update a course
 */
export async function createOrUpdateCourse(data: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR")) {
      return { success: false, message: "Unauthorized" }
    }

    // Validate required fields
    if (!data.code || !data.title || !data.credits || !data.departmentId) {
      return { success: false, message: "Missing required fields" }
    }

    // Check if course with same code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        code: data.code,
        NOT: data.id ? { id: data.id } : undefined,
      },
    })

    if (existingCourse) {
      return { success: false, message: "Course with this code already exists" }
    }

    // Create or update course
    let course
    if (data.id) {
      course = await db.course.update({
        where: { id: data.id },
        data: {
          code: data.code,
          title: data.title,
          credits: Number(data.credits),
          departmentId: data.departmentId,
          description: data.description,
        },
      })
    } else {
      course = await db.course.create({
        data: {
          code: data.code,
          title: data.title,
          credits: Number(data.credits),
          departmentId: data.departmentId,
          description: data.description,
        },
      })
    }

    revalidatePath("/dashboard/courses")
    return { success: true, course }
  } catch (error) {
    console.error("Error creating/updating course:", error)
    return { success: false, message: "Failed to create/update course", error: error.message }
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR")) {
      return { success: false, message: "Unauthorized" }
    }

    await db.course.delete({
      where: { id },
    })

    revalidatePath("/dashboard/courses")
    return { success: true }
  } catch (error) {
    console.error("Error deleting course:", error)
    return { success: false, message: "Failed to delete course", error: error.message }
  }
}

/**
 * Get student courses
 */
export async function getStudentCourses(userId: string) {
  try {
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
        semester: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, courseUploads }
  } catch (error) {
    console.error("Error fetching student courses:", error)
    return { success: false, message: "Failed to fetch student courses", error: error.message }
  }
}

/**
 * Get courses for a specific semester
 */
export async function getSemesterCourses(semesterId: string) {
  try {
    const semesterCourses = await db.semesterCourse.findMany({
      where: {
        semesterId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    return { success: true, semesterCourses }
  } catch (error) {
    console.error("Error fetching semester courses:", error)
    return { success: false, message: "Failed to fetch semester courses", error: error.message }
  }
}

/**
 * Get courses for a specific program
 */
export async function getProgramCourses(programId: string) {
  try {
    const programCourses = await db.programCourse.findMany({
      where: {
        programId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    return { success: true, programCourses }
  } catch (error) {
    console.error("Error fetching program courses:", error)
    return { success: false, message: "Failed to fetch program courses", error: error.message }
  }
}
