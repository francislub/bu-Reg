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

    // Get current total credit hours for this semester
    const currentCourseUploads = await db.courseUpload.findMany({
      where: {
        userId,
        semesterId,
      },
      include: {
        course: true,
      },
    })

    // Get the course to be added
    const courseToAdd = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!courseToAdd) {
      return { success: false, message: "Course not found" }
    }

    // Calculate total credit hours including the new course
    const currentCreditHours = currentCourseUploads.reduce((total, cu) => total + cu.course.credits, 0)
    const newTotalCreditHours = currentCreditHours + courseToAdd.credits

    // Check if adding this course would exceed the maximum credit hours (24)
    if (newTotalCreditHours > 24) {
      return {
        success: false,
        message: `Adding this course would exceed the maximum of 24 credit hours. Current: ${currentCreditHours}, Course: ${courseToAdd.credits}`,
      }
    }

    // Check if the course has the minimum required credit hours (3)
    if (courseToAdd.credits < 3) {
      return { success: false, message: "Course must have at least 3 credit hours" }
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

export async function getAvailableCoursesForStudentProgram(userId: string, semesterId: string) {
  try {
    // Get student profile with program
    const student = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!student || !student.profile?.programId) {
      return { success: false, message: "Student program not found" }
    }

    // Get program courses
    const programCourses = await db.programCourse.findMany({
      where: {
        programId: student.profile.programId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Get semester courses
    const semesterCourses = await db.semesterCourse.findMany({
      where: { semesterId },
      select: {
        courseId: true,
      },
    })

    const semesterCourseIds = semesterCourses.map((sc) => sc.courseId)

    // Filter program courses to only include those available in the semester
    const availableCourses = programCourses
      .filter((pc) => semesterCourseIds.includes(pc.courseId))
      .map((pc) => pc.course)

    return {
      success: true,
      courses: availableCourses,
    }
  } catch (error) {
    console.error("Error fetching available courses for student program:", error)
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

export async function approveCourseRegistration(courseUploadId: string, approverId: string) {
  try {
    // Check if course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
      include: {
        course: true,
        user: true,
        semester: true,
      },
    })

    if (!courseUpload) {
      return { success: false, message: "Course registration not found" }
    }

    // Update course upload status and create approval record
    const updatedCourseUpload = await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "APPROVED",
        approvals: {
          create: {
            approverId,
            status: "APPROVED",
          },
        },
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${courseUpload.userId}`)
    revalidatePath("/dashboard/registration")

    return { success: true, courseUpload: updatedCourseUpload }
  } catch (error) {
    console.error("Error approving course registration:", error)
    return { success: false, message: "Failed to approve course registration" }
  }
}

export async function rejectCourseRegistration(courseUploadId: string, approverId: string, comments?: string) {
  try {
    // Check if course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
    })

    if (!courseUpload) {
      return { success: false, message: "Course registration not found" }
    }

    // Update course upload status and create approval record
    const updatedCourseUpload = await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "REJECTED",
        approvals: {
          create: {
            approverId,
            status: "REJECTED",
            comments,
          },
        },
      },
      include: {
        course: true,
        user: true,
        semester: true,
        approvals: true,
      },
    })

    // Revalidate paths to update UI
    revalidatePath("/dashboard/approvals")
    revalidatePath(`/dashboard/students/${courseUpload.userId}`)
    revalidatePath("/dashboard/registration")

    return { success: true, courseUpload: updatedCourseUpload }
  } catch (error) {
    console.error("Error rejecting course registration:", error)
    return { success: false, message: "Failed to reject course registration" }
  }
}
