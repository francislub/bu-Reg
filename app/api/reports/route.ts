import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const url = new URL(req.url)
    const reportType = url.searchParams.get("type") || "weekly"
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let start: Date
    let end: Date = new Date()

    // Calculate date range based on report type
    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      switch (reportType) {
        case "weekly":
          start = new Date()
          start.setDate(start.getDate() - 7)
          break
        case "monthly":
          start = new Date()
          start.setMonth(start.getMonth() - 1)
          break
        case "yearly":
          start = new Date()
          start.setFullYear(start.getFullYear() - 1)
          break
        default:
          start = new Date()
          start.setDate(start.getDate() - 7)
      }
    }

    // Get student registrations within the date range
    const registrations = await db.courseRegistration.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: true,
        course: true,
        semester: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get attendance records within the date range
    const attendance = await db.attendance.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        student: true,
        session: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get new students within the date range
    const newStudents = await db.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get new staff within the date range
    const newStaff = await db.user.findMany({
      where: {
        role: "STAFF",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate summary statistics
    const totalNewStudents = newStudents.length
    const totalNewStaff = newStaff.length
    const totalRegistrations = registrations.length
    const approvedRegistrations = registrations.filter((r) => r.status === "APPROVED").length
    const pendingRegistrations = registrations.filter((r) => r.status === "PENDING").length
    const rejectedRegistrations = registrations.filter((r) => r.status === "REJECTED").length

    const totalAttendance = attendance.length
    const presentAttendance = attendance.filter((a) => a.status === "PRESENT").length
    const absentAttendance = attendance.filter((a) => a.status === "ABSENT").length

    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0

    return NextResponse.json({
      reportType,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        totalNewStudents,
        totalNewStaff,
        totalRegistrations,
        approvedRegistrations,
        pendingRegistrations,
        rejectedRegistrations,
        attendanceRate,
      },
      data: {
        registrations,
        attendance,
        newStudents,
        newStaff,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to generate report" }), {
      status: 500,
    })
  }
}
