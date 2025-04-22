import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

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
    // Note: In a real app, you would have a grades model to calculate GPA and pass rates
    // This is a simplified version using attendance data
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

      // Simulate GPA and pass rate (in a real app, these would come from a grades model)
      // These are random values between reasonable ranges
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

    return NextResponse.json({ success: true, departments: filteredData })
  } catch (error) {
    console.error("Error fetching performance data:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching performance data" },
      { status: 500 },
    )
  }
}
