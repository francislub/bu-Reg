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
      // Active students
      activeStudents = await db.registration.count({
        where: {
          semesterId: activeSemester.id,
          status: "APPROVED",
        },
        distinct: ["userId"],
      })

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

    const registrationsByMonth = await db.registration.groupBy({
      by: [
        {
          month: {
            datepart: "month",
            date: "createdAt",
          },
        },
        {
          year: {
            datepart: "year",
            date: "createdAt",
          },
        },
      ],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    })

    // Format registrations by month
    const formattedRegistrationsByMonth = registrationsByMonth.map((item) => {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const monthName = monthNames[item.month - 1]
      return {
        month: `${monthName} ${item.year}`,
        count: item._count.id,
      }
    })

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

      const registrations = activeSemester
        ? await db.courseUpload.count({
            where: {
              semesterId: activeSemester.id,
              course: {
                departmentId: dept.id,
              },
            },
          })
        : 0

      departmentStats.push({
        department: dept.name,
        students,
        courses,
        registrations,
      })
    }

    // Get popular courses
    const popularCourses = await db.courseUpload.groupBy({
      by: ["courseId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    })

    // Format popular courses
    const formattedPopularCourses = []
    for (const item of popularCourses) {
      const course = await db.course.findUnique({
        where: { id: item.courseId },
        include: { department: true },
      })

      if (course) {
        formattedPopularCourses.push({
          course: course.title,
          code: course.code,
          department: course.department.name,
          registrations: item._count.id,
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
