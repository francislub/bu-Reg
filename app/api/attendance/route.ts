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
    const lecturerId = url.searchParams.get("lecturerId")
    const studentId = url.searchParams.get("studentId")
    const courseId = url.searchParams.get("courseId")
    const semesterId = url.searchParams.get("semesterId")

    if (lecturerId) {
      // Get attendance sessions for lecturer
      const sessions = await db.attendanceSession.findMany({
        where: {
          lecturerId,
          ...(courseId ? { courseId } : {}),
          ...(semesterId ? { semesterId } : {}),
        },
        include: {
          course: true,
          semester: true,
          records: {
            include: {
              student: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      })

      return NextResponse.json({ success: true, sessions })
    } else if (studentId) {
      // Get attendance records for student
      const records = await db.attendanceRecord.findMany({
        where: {
          studentId,
          session: {
            ...(courseId ? { courseId } : {}),
            ...(semesterId ? { semesterId } : {}),
          },
        },
        include: {
          session: {
            include: {
              course: true,
              lecturer: {
                include: {
                  profile: true,
                },
              },
              semester: true,
            },
          },
        },
        orderBy: {
          session: {
            date: "desc",
          },
        },
      })

      return NextResponse.json({ success: true, records })
    } else {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching attendance" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is staff
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, lecturerId, semesterId, date, startTime, endTime, topic, attendanceRecords } = body

    // Create attendance session
    const attendanceSession = await db.attendanceSession.create({
      data: {
        courseId,
        lecturerId,
        semesterId,
        date: new Date(date),
        startTime,
        endTime,
        topic,
      },
    })

    // Create attendance records if provided
    if (attendanceRecords && attendanceRecords.length > 0) {
      await Promise.all(
        attendanceRecords.map((record: any) =>
          db.attendanceRecord.create({
            data: {
              sessionId: attendanceSession.id,
              studentId: record.studentId,
              status: record.status,
              comments: record.comments,
            },
          }),
        ),
      )
    }

    return NextResponse.json({ success: true, session: attendanceSession })
  } catch (error) {
    console.error("Attendance session creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during attendance session creation" },
      { status: 500 },
    )
  }
}
