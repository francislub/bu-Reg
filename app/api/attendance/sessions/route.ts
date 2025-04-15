import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const attendanceSessionSchema = z.object({
  courseId: z.string(),
  lecturerId: z.string(),
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  topic: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lecturerId = searchParams.get("lecturerId")
    const courseId = searchParams.get("courseId")
    const semesterId = searchParams.get("semesterId")

    const whereClause: any = {}

    if (lecturerId) {
      whereClause.lecturerId = lecturerId
    }

    if (courseId) {
      whereClause.courseId = courseId
    }

    if (semesterId) {
      whereClause.semesterId = semesterId
    } else {
      // Default to active semester if not specified
      const activeSemester = await prisma.semester.findFirst({
        where: { isActive: true },
      })

      if (activeSemester) {
        whereClause.semesterId = activeSemester.id
      }
    }

    const attendanceSessions = await prisma.attendanceSession.findMany({
      where: whereClause,
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
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    })

    return NextResponse.json(attendanceSessions)
  } catch (error) {
    console.error("Error fetching attendance sessions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.STAFF) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = attendanceSessionSchema.parse(body)

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json({ message: "No active semester found" }, { status: 400 })
    }

    // Create the attendance session
    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        ...validatedData,
        semesterId: activeSemester.id,
      },
      include: {
        course: true,
        lecturer: {
          include: {
            profile: true,
          },
        },
        semester: true,
      },
    })

    return NextResponse.json(attendanceSession, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance session:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
