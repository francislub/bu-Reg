"use server"

import { db } from "@/lib/db"

// Function to generate registration summary report
export async function generateRegistrationSummaryReport(semesterId: string) {
  try {
    // Get semester details
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: { academicYear: true },
    })

    if (!semester) {
      return { success: false, message: "Semester not found" }
    }

    // Get all registrations for this semester
    const registrations = await db.registration.findMany({
      where: { semesterId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Get all course uploads for this semester
    const courseUploads = await db.courseUpload.findMany({
      where: { semesterId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Calculate statistics
    const totalRegistrations = registrations.length
    const approvedRegistrations = registrations.filter((reg) => reg.status === "APPROVED").length
    const pendingRegistrations = registrations.filter((reg) => reg.status === "PENDING").length
    const rejectedRegistrations = registrations.filter((reg) => reg.status === "REJECTED").length

    // Group course uploads by course
    const courseStats = {}
    courseUploads.forEach((cu) => {
      if (!courseStats[cu.courseId]) {
        courseStats[cu.courseId] = {
          courseCode: cu.course.code,
          courseTitle: cu.course.title,
          department: cu.course.department.name,
          totalStudents: 0,
          approvedStudents: 0,
          pendingStudents: 0,
          rejectedStudents: 0,
        }
      }

      courseStats[cu.courseId].totalStudents++
      if (cu.status === "APPROVED") courseStats[cu.courseId].approvedStudents++
      if (cu.status === "PENDING") courseStats[cu.courseId].pendingStudents++
      if (cu.status === "REJECTED") courseStats[cu.courseId].rejectedStudents++
    })

    // Group registrations by department
    const departmentStats = {}
    registrations.forEach((reg) => {
      const departmentId = reg.user.profile?.departmentId
      if (!departmentId) return

      if (!departmentStats[departmentId]) {
        departmentStats[departmentId] = {
          totalStudents: 0,
          approvedStudents: 0,
          pendingStudents: 0,
          rejectedStudents: 0,
        }
      }

      departmentStats[departmentId].totalStudents++
      if (reg.status === "APPROVED") departmentStats[departmentId].approvedStudents++
      if (reg.status === "PENDING") departmentStats[departmentId].pendingStudents++
      if (reg.status === "REJECTED") departmentStats[departmentId].rejectedStudents++
    })

    // Create report
    const report = {
      semester: {
        id: semester.id,
        name: semester.name,
        academicYear: semester.academicYear.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
      },
      summary: {
        totalRegistrations,
        approvedRegistrations,
        pendingRegistrations,
        rejectedRegistrations,
      },
      courseStats: Object.values(courseStats),
      departmentStats,
      generatedAt: new Date(),
    }

    return { success: true, report }
  } catch (error) {
    console.error("Error generating registration summary report:", error)
    return { success: false, message: "Failed to generate report" }
  }
}

// Function to generate student enrollment report
export async function generateStudentEnrollmentReport(academicYearId?: string) {
  try {
    // Get all academic years or specific one
    const academicYears = academicYearId
      ? [await db.academicYear.findUnique({ where: { id: academicYearId } })]
      : await db.academicYear.findMany({ orderBy: { startDate: "desc" } })

    if (!academicYears.length || academicYears[0] === null) {
      return { success: false, message: "Academic year not found" }
    }

    const enrollmentData = []

    // For each academic year
    for (const academicYear of academicYears) {
      // Get all semesters for this academic year
      const semesters = await db.semester.findMany({
        where: { academicYearId: academicYear.id },
        orderBy: { startDate: "asc" },
      })

      const semesterData = []

      // For each semester
      for (const semester of semesters) {
        // Get all registrations for this semester
        const registrations = await db.registration.count({
          where: { semesterId: semester.id, status: "APPROVED" },
        })

        // Get new students (first registration in the system)
        const newStudents = await db.registration.count({
          where: {
            semesterId: semester.id,
            status: "APPROVED",
            user: {
              registrations: {
                every: {
                  createdAt: {
                    gte: semester.startDate,
                  },
                },
              },
            },
          },
        })

        // Get returning students
        const returningStudents = registrations - newStudents

        semesterData.push({
          semesterId: semester.id,
          semesterName: semester.name,
          totalStudents: registrations,
          newStudents,
          returningStudents,
        })
      }

      enrollmentData.push({
        academicYearId: academicYear.id,
        academicYearName: academicYear.name,
        semesters: semesterData,
      })
    }

    // Create report
    const report = {
      enrollmentData,
      generatedAt: new Date(),
    }

    return { success: true, report }
  } catch (error) {
    console.error("Error generating student enrollment report:", error)
    return { success: false, message: "Failed to generate report" }
  }
}

// Function to generate course popularity report
export async function generateCoursePopularityReport(semesterId: string) {
  try {
    // Get semester details
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: { academicYear: true },
    })

    if (!semester) {
      return { success: false, message: "Semester not found" }
    }

    // Get all course uploads for this semester
    const courseUploads = await db.courseUpload.findMany({
      where: { semesterId },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Group by course and count
    const courseCounts = {}
    courseUploads.forEach((cu) => {
      if (!courseCounts[cu.courseId]) {
        courseCounts[cu.courseId] = {
          courseId: cu.courseId,
          courseCode: cu.course.code,
          courseTitle: cu.course.title,
          department: cu.course.department.name,
          totalRegistrations: 0,
          approvedRegistrations: 0,
          pendingRegistrations: 0,
          rejectedRegistrations: 0,
        }
      }

      courseCounts[cu.courseId].totalRegistrations++
      if (cu.status === "APPROVED") courseCounts[cu.courseId].approvedRegistrations++
      if (cu.status === "PENDING") courseCounts[cu.courseId].pendingRegistrations++
      if (cu.status === "REJECTED") courseCounts[cu.courseId].rejectedRegistrations++
    })

    // Convert to array and sort by popularity
    const coursePopularity = Object.values(courseCounts).sort((a, b) => b.totalRegistrations - a.totalRegistrations)

    // Create report
    const report = {
      semester: {
        id: semester.id,
        name: semester.name,
        academicYear: semester.academicYear.name,
      },
      coursePopularity,
      generatedAt: new Date(),
    }

    return { success: true, report }
  } catch (error) {
    console.error("Error generating course popularity report:", error)
    return { success: false, message: "Failed to generate report" }
  }
}
