import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

// Schema for creating/updating exam schedules
const examScheduleSchema = z.object({
  courseId: z.string(),
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
  venue: z.string(),
  examType: z.enum(["MIDTERM", "FINAL", "SUPPLEMENTARY"]),
  semesterId: z.string(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const semesterId = searchParams.get("semesterId")
    const departmentId = searchParams.get("departmentId")
    const examType = searchParams.get("examType")

    const whereClause: any = {}

    if (semesterId) {
      whereClause.semesterId = semesterId
    } else {
      // Default to active semester if no semester is specified
      const activeSemester = await prisma.semester.findFirst({
        where: { isActive: true },
      })
      if (activeSemester) {
        whereClause.semesterId = activeSemester.id
      }
    }

    if (departmentId) {
      whereClause.course = {
        departmentId,
      }
    }

    if (examType) {
      whereClause.examType = examType
    }

    const examSchedules = await prisma.examSchedule.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json(examSchedules)
  } catch (error) {
    console.error("Error fetching exam schedules:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = examScheduleSchema.parse(body)

    // Check if there's already an exam scheduled for the same course in the same semester
    const existingExam = await prisma.examSchedule.findFirst({
      where: {
        courseId: validatedData.courseId,
        semesterId: validatedData.semesterId,
        examType: validatedData.examType,
      },
    })

    if (existingExam) {
      return NextResponse.json(
        { message: "An exam is already scheduled for this course in this semester" },
        { status: 409 },
      )
    }

    // Check for venue conflicts
    const venueConflict = await prisma.examSchedule.findFirst({
      where: {
        semesterId: validatedData.semesterId,
        date: new Date(validatedData.date),
        venue: validatedData.venue,
        OR: [
          {
            startTime: { lte: validatedData.startTime },
            endTime: { gt: validatedData.startTime },
          },
          {
            startTime: { lt: validatedData.endTime },
            endTime: { gte: validatedData.endTime },
          },
          {
            startTime: { gte: validatedData.startTime },
            endTime: { lte: validatedData.endTime },
          },
        ],
      },
    })

    if (venueConflict) {
      return NextResponse.json(
        { message: "There is a scheduling conflict with the selected venue, date, and time" },
        { status: 409 },
      )
    }

    const examSchedule = await prisma.examSchedule.create({
      data: {
        courseId: validatedData.courseId,
        date: new Date(validatedData.date),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        venue: validatedData.venue,
        examType: validatedData.examType,
        semesterId: validatedData.semesterId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
    })

    return NextResponse.json(examSchedule, { status: 201 })
  } catch (error) {
    console.error("Error creating exam schedule:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
