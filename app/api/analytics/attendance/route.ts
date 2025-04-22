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

    // Get active semester
    const activeSemester = await db.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
    }

    if (lecturerId) {
      // Get attendance data for lecturer's courses
      const attendanceSessions = await db.attendanceSession.findMany({
        where: {
          lecturerId,
          semesterId: activeSemester.id,
        },
        include: {
          course: true,
          records: true,
        },
      })

      // Group by course and calculate statistics
      const courseMap = new Map()

      attendanceSessions.forEach((session) => {
        const courseId = session.courseId
        const courseCode = session.course.code

        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, {
            code: courseCode,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            totalCount: 0,
          })
        }

        const courseStats = courseMap.get(courseId)

        session.records.forEach((record) => {
          courseStats.totalCount++

          if (record.status === "PRESENT") {
            courseStats.presentCount++
          } else if (record.status === "ABSENT") {
            courseStats.absentCount++
          } else if (record.status === "LATE") {
            courseStats.lateCount++
          }
        })
      })

      const courses = Array.from(courseMap.values())

      return NextResponse.json({ success: true, courses })
    } else if (studentId) {
      // Get attendance data for student
      const attendanceRecords = await db.attendanceRecord.findMany({
        where: {
          studentId,
          session: {
            semesterId: activeSemester.id,
          },
        },
        include: {
          session: {
            include: {
              course: true,
            },
          },
        },
      })

      // Group by course and calculate statistics
      const courseMap = new Map()

      attendanceRecords.forEach((record) => {
        const courseId = record.session.courseId
        const courseCode = record.session.course.code

        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, {
            code: courseCode,
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
          })
        }

        const courseStats = courseMap.get(courseId)
        courseStats.total++

        if (record.status === "PRESENT") {
          courseStats.present++
        } else if (record.status === "ABSENT") {
          courseStats.absent++
        } else if (record.status === "LATE") {
          courseStats.late++
        }
      })

      const courses = Array.from(courseMap.values()).map((course) => ({
        ...course,
        rate: course.total > 0 ? Math.round((course.present / course.total) * 100 * 10) / 10 : 0,
      }))

      return NextResponse.json({ success: true, courses })
    } else {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching attendance data" },
      { status: 500 },
    )
  }
}
