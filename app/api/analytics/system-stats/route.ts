import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get active semester
    const activeSemester = await db.semester.findFirst({
      where: { isActive: true },
      include: { academicYear: true },
    })

    // Get total counts
    const totalStudents = await db.user.count({ where: { role: "STUDENT" } })
    const totalCourses = await db.course.count()
    const totalPrograms = await db.program.count()
    const totalDepartments = await db.department.count()

    // Get active students (with approved registrations in active semester)
    let activeStudents = 0
    let activeCourses = 0
    let currentRegistrations = 0
    let approvedRegistrations = 0

    if (activeSemester) {
      // Active students - fixed to use findMany with distinct and then count the results
      const distinctStudents = await db.registration.findMany({
        where: {
          semesterId: activeSemester.id,
          status: "APPROVED",
        },
        distinct: ["userId"],
        select: { userId: true },
      })
      activeStudents = distinctStudents.length

      // Active courses
      activeCourses = await db.semesterCourse.count({
        where: {
          semesterId: activeSemester.id,
        },
      })

      // Current registrations
      currentRegistrations = await db.registration.count({
        where: {
          semesterId: activeSemester.id,
        },
      })

      // Approved registrations
      approvedRegistrations = await db.registration.count({
        where: {
          semesterId: activeSemester.id,
          status: "APPROVED",
        },
      })
    }

    // Get users by role
    const usersByRole = await db.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
    })

    // Format users by role
    const formattedUsersByRole = usersByRole.map((item) => ({
      role: item.role,
      count: item._count.id,
    }))

    // Get registrations by status
    const registrationsByStatus = await db.registration.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    })

    // Format registrations by status
    const formattedRegistrationsByStatus = registrationsByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))

    // Get registrations by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Use a simpler approach for registrations by month to avoid potential issues
    const recentRegistrations = await db.registration.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Process the registrations to group by month
    const registrationsByMonth = recentRegistrations.reduce(
      (acc, reg) => {
        const date = new Date(reg.createdAt)
        const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`

        if (!acc[monthYear]) {
          acc[monthYear] = 0
        }
        acc[monthYear]++
        return acc
      },
      {} as Record<string, number>,
    )

    // Format registrations by month
    const formattedRegistrationsByMonth = Object.entries(registrationsByMonth).map(([month, count]) => ({
      month,
      count,
    }))

    // Get students by program
    const studentsByProgram = await db.profile.groupBy({
      by: ["program"],
      _count: {
        id: true,
      },
    })

    // Format students by program
    const formattedStudentsByProgram = studentsByProgram
      .filter((item) => item.program) // Filter out null programs
      .map((item) => ({
        program: item.program || "Unassigned",
        count: item._count.id,
      }))

    // Get department statistics
    const departments = await db.department.findMany()
    const departmentStats = []

    for (const dept of departments) {
      const students = await db.profile.count({
        where: { departmentId: dept.id },
      })

      const courses = await db.course.count({
        where: { departmentId: dept.id },
      })

      // Use a safer approach for registrations count
      let registrations = 0
      if (activeSemester) {
        const courseIds = await db.course.findMany({
          where: { departmentId: dept.id },
          select: { id: true },
        })

        if (courseIds.length > 0) {
          registrations = await db.courseUpload.count({
            where: {
              semesterId: activeSemester.id,
              courseId: { in: courseIds.map((c) => c.id) },
            },
          })
        }
      }

      departmentStats.push({
        department: dept.name,
        students,
        courses,
        registrations,
      })
    }

    // Get popular courses - using a safer approach
    const courseUploads = await db.courseUpload.groupBy({
      by: ["courseId"],
      _count: {
        id: true,
      },
    })

    // Sort by count and take top 10
    const topCourseIds = courseUploads
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10)
      .map((item) => item.courseId)

    // Format popular courses
    const formattedPopularCourses = []
    for (const courseId of topCourseIds) {
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: { department: true },
      })

      if (course) {
        const registrationCount = courseUploads.find((c) => c.courseId === courseId)?._count.id || 0

        formattedPopularCourses.push({
          course: course.title,
          code: course.code,
          department: course.department.name,
          registrations: registrationCount,
        })
      }
    }

    // Get courses by department
    const coursesByDepartment = await db.course.groupBy({
      by: ["departmentId"],
      _count: {
        id: true,
      },
    })

    // Format courses by department
    const formattedCoursesByDepartment = []
    for (const item of coursesByDepartment) {
      const department = await db.department.findUnique({
        where: { id: item.departmentId },
      })

      if (department) {
        formattedCoursesByDepartment.push({
          department: department.name,
          courses: item._count.id,
        })
      }
    }

    // Get course registration status
    const courseRegistrationStatus = await db.courseUpload.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    })

    // Format course registration status
    const formattedCourseRegistrationStatus = courseRegistrationStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }))

    // Compile all stats
    const stats = {
      totalStudents,
      activeStudents,
      totalCourses,
      activeCourses,
      totalPrograms,
      totalDepartments,
      currentRegistrations,
      approvedRegistrations,
      usersByRole: formattedUsersByRole,
      registrationsByStatus: formattedRegistrationsByStatus,
      registrationsByMonth: formattedRegistrationsByMonth,
      studentsByProgram: formattedStudentsByProgram,
      departmentStats,
      popularCourses: formattedPopularCourses,
      coursesByDepartment: formattedCoursesByDepartment,
      courseRegistrationStatus: formattedCourseRegistrationStatus,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching system statistics:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching system statistics" },
      { status: 500 },
    )
  }
}
