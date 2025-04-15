import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Students can only view their own attendance stats, admins or staff can view any
    if (session.user.role === "STUDENT" && session.user.id !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const studentId = params.id

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json({
        totalSessions: 0,
        present: 0,
        absent: 0,
        studentLate: 0,
        presentPercentage: 0,
        absentPercentage: 0,
        latePercentage: 0,
      })
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: {
          semesterId: activeSemester.id,
        },
      },
      select: {
        status: true,
      },
    })

    const totalSessions = records.length
    const present = records.filter((r) => r.status === "PRESENT").length
    const absent = records.filter((r) => r.status === "ABSENT").length
    const studentLate = records.filter((r) => r.status === "LATE").length

    return NextResponse.json({
      totalSessions,
      present,
      absent,
      studentLate,
      presentPercentage: totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0,
      absentPercentage: totalSessions > 0 ? Math.round((absent / totalSessions) * 100) : 0,
      latePercentage: totalSessions > 0 ? Math.round((studentLate / totalSessions) * 100) : 0,
    })
  } catch (error) {
    console.error("Error fetching student attendance stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
