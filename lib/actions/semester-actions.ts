"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendRegistrationDeadlineEmail } from "@/lib/email"

export async function getAllSemesters() {
  try {
    const semesters = await db.semester.findMany({
      include: {
        academicYear: true,
        semesterCourses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return { success: true, semesters }
  } catch (error) {
    console.error("Error fetching semesters:", error)
    return { success: false, message: "Failed to fetch semesters" }
  }
}

export async function getActiveSemester() {
  try {
    const semester = await db.semester.findFirst({
      where: { isActive: true },
      include: {
        academicYear: true,
        semesterCourses: {
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

    if (!semester) {
      return { success: false, message: "No active semester found" }
    }

    return { success: true, semester }
  } catch (error) {
    console.error("Error fetching active semester:", error)
    return { success: false, message: "Failed to fetch active semester" }
  }
}

export async function getSemesterById(semesterId: string) {
  try {
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: {
        academicYear: true,
        semesterCourses: {
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

    if (!semester) {
      return { success: false, message: "Semester not found" }
    }

    return { success: true, semester }
  } catch (error) {
    console.error("Error fetching semester:", error)
    return { success: false, message: "Failed to fetch semester" }
  }
}

export async function createSemester(data: {
  name: string
  academicYearId: string
  startDate: Date
  endDate: Date
  isActive: boolean
  registrationDeadline?: Date
  courseUploadDeadline?: Date
}) {
  try {
    // If setting this semester as active, deactivate all other semesters
    if (data.isActive) {
      await db.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const semester = await db.semester.create({
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        registrationDeadline: data.registrationDeadline,
        courseUploadDeadline: data.courseUploadDeadline,
      },
    })

    revalidatePath("/dashboard/semesters")
    return { success: true, semester }
  } catch (error) {
    console.error("Error creating semester:", error)
    return { success: false, message: "Failed to create semester" }
  }
}

export async function updateSemester(
  semesterId: string,
  data: {
    name: string
    academicYearId: string
    startDate: Date
    endDate: Date
    isActive: boolean
    registrationDeadline?: Date
    courseUploadDeadline?: Date
  },
) {
  try {
    // If setting this semester as active, deactivate all other semesters
    if (data.isActive) {
      await db.semester.updateMany({
        where: {
          isActive: true,
          NOT: {
            id: semesterId,
          },
        },
        data: { isActive: false },
      })
    }

    const semester = await db.semester.update({
      where: { id: semesterId },
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        registrationDeadline: data.registrationDeadline,
        courseUploadDeadline: data.courseUploadDeadline,
      },
    })

    revalidatePath("/dashboard/semesters")
    return { success: true, semester }
  } catch (error) {
    console.error("Error updating semester:", error)
    return { success: false, message: "Failed to update semester" }
  }
}

export async function deleteSemester(semesterId: string) {
  try {
    await db.semester.delete({
      where: { id: semesterId },
    })

    revalidatePath("/dashboard/semesters")
    return { success: true, message: "Semester deleted successfully" }
  } catch (error) {
    console.error("Error deleting semester:", error)
    return { success: false, message: "Failed to delete semester" }
  }
}

export async function getSemestersByAcademicYear(academicYearId: string) {
  try {
    const semesters = await db.semester.findMany({
      where: {
        academicYearId,
      },
      include: {
        academicYear: true,
        semesterCourses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    })

    return { success: true, semesters }
  } catch (error) {
    console.error("Error fetching semesters by academic year:", error)
    return { success: false, message: "Failed to fetch semesters" }
  }
}

export async function addCourseToSemester(semesterId: string, courseId: string) {
  try {
    // Check if course is already in semester
    const existingSemesterCourse = await db.semesterCourse.findUnique({
      where: {
        semesterId_courseId: {
          semesterId,
          courseId,
        },
      },
    })

    if (existingSemesterCourse) {
      return { success: false, message: "Course is already in this semester" }
    }

    // Add course to semester
    await db.semesterCourse.create({
      data: {
        semesterId,
        courseId,
      },
    })

    revalidatePath("/dashboard/semesters")
    return { success: true, message: "Course added to semester successfully" }
  } catch (error) {
    console.error("Error adding course to semester:", error)
    return { success: false, message: "Failed to add course to semester" }
  }
}

export async function removeCourseFromSemester(semesterId: string, courseId: string) {
  try {
    await db.semesterCourse.delete({
      where: {
        semesterId_courseId: {
          semesterId,
          courseId,
        },
      },
    })

    revalidatePath("/dashboard/semesters")
    return { success: true, message: "Course removed from semester successfully" }
  } catch (error) {
    console.error("Error removing course from semester:", error)
    return { success: false, message: "Failed to remove course from semester" }
  }
}

// Add a new function to send registration deadline reminders
export async function sendRegistrationDeadlineReminders(semesterId: string) {
  try {
    // Get the semester details
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: {
        academicYear: true,
      },
    })

    if (!semester) {
      return { success: false, message: "Semester not found" }
    }

    // Get all students who haven't registered for this semester yet
    const registeredStudentIds = await db.registration.findMany({
      where: {
        semesterId,
      },
      select: {
        userId: true,
      },
    })

    const registeredIds = registeredStudentIds.map((reg) => reg.userId)

    // Find students who haven't registered
    const unregisteredStudents = await db.user.findMany({
      where: {
        role: "STUDENT",
        id: {
          notIn: registeredIds,
        },
      },
      include: {
        profile: true,
      },
    })

    // Send reminder emails
    let successCount = 0
    let failureCount = 0

    for (const student of unregisteredStudents) {
      if (student.email) {
        try {
          await sendRegistrationDeadlineEmail(
            student.email,
            student.profile ? `${student.profile.firstName} ${student.profile.lastName}` : student.name,
            `${semester.academicYear.year} ${semester.name}`,
            semester.endDate,
          )
          successCount++
        } catch (error) {
          console.error(`Failed to send reminder to ${student.email}:`, error)
          failureCount++
        }
      }
    }

    return {
      success: true,
      message: `Sent ${successCount} reminders successfully. Failed to send ${failureCount} reminders.`,
      stats: {
        total: unregisteredStudents.length,
        success: successCount,
        failure: failureCount,
      },
    }
  } catch (error) {
    console.error("Error sending registration deadline reminders:", error)
    return { success: false, message: "Failed to send reminders", error: error.message }
  }
}
