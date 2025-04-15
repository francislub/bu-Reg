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

    // Students can only view their own attendance, admins or staff can view any
    if (session.user.role === "STUDENT" && session.user.id !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const studentId = params.id

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json([])
    }

    // Get attendance records for the student in the active semester
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: {
          semesterId: activeSemester.id,
        },
      },
      include: {
        session: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
            lecturer: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        session: {
          date: "desc",
        },
      },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching student attendance records:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
