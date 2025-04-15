import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: true,
        lecturer: {
          include: {
            profile: true,
          },
        },
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
    })

    if (!attendanceSession) {
      return NextResponse.json({ message: "Attendance session not found" }, { status: 404 })
    }

    return NextResponse.json(attendanceSession)
  } catch (error) {
    console.error("Error fetching attendance session:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.STAFF) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if session exists and belongs to this lecturer
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: {
        id: params.id,
        lecturerId: session.user.id,
      },
    })

    if (!attendanceSession) {
      return NextResponse.json({ message: "Attendance session not found or unauthorized" }, { status: 404 })
    }

    // Delete all attendance records first
    await prisma.attendanceRecord.deleteMany({
      where: {
        sessionId: params.id,
      },
    })

    // Delete the session
    await prisma.attendanceSession.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Attendance session deleted successfully" })
  } catch (error) {
    console.error("Error deleting attendance session:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
