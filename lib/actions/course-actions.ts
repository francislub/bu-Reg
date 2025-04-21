"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAllCourses() {
  try {
    const courses = await db.course.findMany({
      include: {
        department: true,
        semesterCourses: {
          include: {
            semester: true,
          },
        },
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
        semesterCourses: {
          include: {
            semester: true,
          },
        },
        lecturerCourses: {
          include: {
            lecturer: {
              include: {
                profile: true,
              },
            },
            semester: true,
          },
        },
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
  description?: string
  departmentId: string
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
        description: data.description,
        departmentId: data.departmentId,
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
    description?: string
    departmentId: string
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
        description: data.description,
        departmentId: data.departmentId,
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

export async function assignCourseToSemester(courseId: string, semesterId: string) {
  try {
    // Check if course is already assigned to semester
    const existingSemesterCourse = await db.semesterCourse.findUnique({
      where: {
        semesterId_courseId: {
          semesterId,
          courseId,
        },
      },
    })

    if (existingSemesterCourse) {
      return { success: false, message: "Course is already assigned to this semester" }
    }

    await db.semesterCourse.create({
      data: {
        courseId,
        semesterId,
      },
    })

    revalidatePath("/dashboard/courses")
    revalidatePath("/dashboard/semesters")
    return { success: true, message: "Course assigned to semester successfully" }
  } catch (error) {
    console.error("Error assigning course to semester:", error)
    return { success: false, message: "Failed to assign course to semester" }
  }
}

export async function removeCourseFromSemester(courseId: string, semesterId: string) {
  try {
    await db.semesterCourse.delete({
      where: {
        semesterId_courseId: {
          semesterId,
          courseId,
        },
      },
    })

    revalidatePath("/dashboard/courses")
    revalidatePath("/dashboard/semesters")
    return { success: true, message: "Course removed from semester successfully" }
  } catch (error) {
    console.error("Error removing course from semester:", error)
    return { success: false, message: "Failed to remove course from semester" }
  }
}

export async function assignLecturerToCourse(lecturerId: string, courseId: string, semesterId: string) {
  try {
    // Check if lecturer is already assigned to this course in this semester
    const existingLecturerCourse = await db.lecturerCourse.findUnique({
      where: {
        lecturerId_courseId_semesterId: {
          lecturerId,
          courseId,
          semesterId,
        },
      },
    })

    if (existingLecturerCourse) {
      return { success: false, message: "Lecturer is already assigned to this course in this semester" }
    }

    await db.lecturerCourse.create({
      data: {
        lecturerId,
        courseId,
        semesterId,
      },
    })

    revalidatePath("/dashboard/courses")
    return { success: true, message: "Lecturer assigned to course successfully" }
  } catch (error) {
    console.error("Error assigning lecturer to course:", error)
    return { success: false, message: "Failed to assign lecturer to course" }
  }
}

export async function removeLecturerFromCourse(lecturerId: string, courseId: string, semesterId: string) {
  try {
    await db.lecturerCourse.delete({
      where: {
        lecturerId_courseId_semesterId: {
          lecturerId,
          courseId,
          semesterId,
        },
      },
    })

    revalidatePath("/dashboard/courses")
    return { success: true, message: "Lecturer removed from course successfully" }
  } catch (error) {
    console.error("Error removing lecturer from course:", error)
    return { success: false, message: "Failed to remove lecturer from course" }
  }
}

export async function getStudentCourses(userId: string, semesterId?: string) {
  try {
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
    console.error("Error fetching student courses:", error)
    return { success: false, message: "Failed to fetch student courses" }
  }
}
