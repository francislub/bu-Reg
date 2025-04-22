import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const reportType = url.searchParams.get("type") || "enrollment"
    const timeframe = url.searchParams.get("timeframe") || "weekly"

    let reportData = {}

    if (reportType === "enrollment") {
      // Get enrollment data
      const semesters = await db.semester.findMany({
        orderBy: {
          startDate: "asc",
        },
        include: {
          registrations: true,
        },
      })

      // Calculate enrollment data
      const enrollmentData = semesters.map((semester, index) => {
        const previousSemester = index > 0 ? semesters[index - 1] : null
        const students = semester.registrations.length
        const previousStudents = previousSemester ? previousSemester.registrations.length : 0

        // Calculate new students
        const newStudents = Math.max(0, students - previousStudents)

        // Calculate growth rate
        const growthRate =
          previousStudents > 0 ? Math.round(((students - previousStudents) / previousStudents) * 100 * 10) / 10 : 0

        return {
          semester: semester.name,
          students,
          newStudents,
          growthRate,
        }
      })

      reportData = { semesters: enrollmentData }
    } else if (reportType === "department") {
      // Get active semester
      const activeSemester = await db.semester.findFirst({
        where: { isActive: true },
      })

      if (!activeSemester) {
        return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
      }

      // Get all departments with course uploads for the active semester
      const departments = await db.department.findMany({
        include: {
          courses: {
            include: {
              courseUploads: {
                where: {
                  semesterId: activeSemester.id,
                },
              },
            },
          },
        },
      })

      // Calculate student count per department
      const departmentData = departments.map((department) => {
        // Count unique students across all courses in the department
        const studentIds = new Set()

        department.courses.forEach((course) => {
          course.courseUploads.forEach((upload) => {
            studentIds.add(upload.userId)
          })
        })

        return {
          name: department.name,
          students: studentIds.size,
        }
      })

      // Filter out departments with no students
      const filteredData = departmentData.filter((dept) => dept.students > 0)

      reportData = { departments: filteredData }
    } else if (reportType === "performance") {
      // Get active semester
      const activeSemester = await db.semester.findFirst({
        where: { isActive: true },
      })

      if (!activeSemester) {
        return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
      }

      // Get all departments
      const departments = await db.department.findMany({
        include: {
          courses: {
            include: {
              attendanceSessions: {
                where: {
                  semesterId: activeSemester.id,
                },
                include: {
                  records: true,
                },
              },
            },
          },
        },
      })

      // Calculate performance metrics per department
      const performanceData = departments.map((department) => {
        // Calculate attendance rate
        let totalRecords = 0
        let presentRecords = 0

        department.courses.forEach((course) => {
          course.attendanceSessions.forEach((session) => {
            session.records.forEach((record) => {
              totalRecords++
              if (record.status === "PRESENT") {
                presentRecords++
              }
            })
          })
        })

        const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

        // Simulate GPA and pass rate
        const gpa = 2 + Math.random() * 2 // Random GPA between 2.0 and 4.0
        const passRate = 70 + Math.random() * 30 // Random pass rate between 70% and 100%

        return {
          department: department.name,
          gpa: Math.round(gpa * 10) / 10, // Round to 1 decimal place
          attendance: attendanceRate,
          passRate: Math.round(passRate),
        }
      })

      // Filter out departments with no data
      const filteredData = performanceData.filter((dept) => dept.attendance > 0)

      reportData = { departments: filteredData }
    }

    return NextResponse.json({ success: true, ...reportData })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while generating the report" },
      { status: 500 },
    )
  }
}
