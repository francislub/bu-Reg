import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const timetableSlotSchema = z.object({
  courseId: z.string(),
  lecturerCourseId: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  roomNumber: z.string(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const slots = await prisma.timetableSlot.findMany({
      where: {
        timetableId: params.id,
      },
      include: {
        course: true,
        lecturerCourse: {
          include: {
            lecturer: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json(slots)
  } catch (error) {
    console.error("Error fetching timetable slots:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if the timetable exists
    const timetable = await prisma.timetable.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!timetable) {
      return NextResponse.json({ message: "Timetable not found" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = timetableSlotSchema.parse(body)

    // Check for time conflicts
    const existingSlots = await prisma.timetableSlot.findMany({
      where: {
        timetableId: params.id,
        dayOfWeek: validatedData.dayOfWeek,
        OR: [
          {
            // New slot starts during an existing slot
            startTime: {
              gte: validatedData.startTime,
              lt: validatedData.endTime,
            },
          },
          {
            // New slot ends during an existing slot
            endTime: {
              gt: validatedData.startTime,
              lte: validatedData.endTime,
            },
          },
          {
            // New slot completely contains an existing slot
            startTime: {
              lte: validatedData.startTime,
            },
            endTime: {
              gte: validatedData.endTime,
            },
          },
        ],
      },
    })

    if (existingSlots.length > 0) {
      return NextResponse.json(
        {
          message: "Time conflict with existing slot(s)",
          conflicts: existingSlots,
        },
        { status: 409 },
      )
    }

    // Create the timetable slot
    const slot = await prisma.timetableSlot.create({
      data: {
        timetableId: params.id,
        ...validatedData,
      },
      include: {
        course: true,
        lecturerCourse: {
          include: {
            lecturer: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    console.error("Error creating timetable slot:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
