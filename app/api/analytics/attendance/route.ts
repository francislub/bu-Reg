import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") || session.user.id

    // Get current semester
    const currentSemester = await db.semester.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    if (!currentSemester) {
      return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
    }

    // Get attendance records for the user in the current semester
    const attendanceRecords = await db.attendanceRecord.findMany({
      where: {
        userId,
        semesterId: currentSemester.id,
      },
      include: {
        course: true,
      },
    })

    // Group attendance by course
    const courseAttendance = attendanceRecords.reduce((acc: any, record) => {
      const courseId = record.courseId
      const courseName = record.course.code

      if (!acc[courseId]) {
        acc[courseId] = {
          course: courseName,
          present: 0,
          absent: 0,
          total: 0,
          rate: 0,
        }
      }

      if (record.status === "PRESENT") {
        acc[courseId].present += 1
      } else if (record.status === "ABSENT") {
        acc[courseId].absent += 1
      }

      acc[courseId].total += 1
      acc[courseId].rate = Number.parseFloat(((acc[courseId].present / acc[courseId].total) * 100).toFixed(1))

      return acc
    }, {})

    // Convert to array
    const data = Object.values(courseAttendance)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching attendance analytics:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching attendance analytics" },
      { status: 500 },
    )
  }
}
