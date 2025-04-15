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

export async function GET(req: Request, { params }: { params: { id: string; slotId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const slot = await prisma.timetableSlot.findUnique({
      where: {
        id: params.slotId,
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
    })

    if (!slot) {
      return NextResponse.json({ message: "Timetable slot not found" }, { status: 404 })
    }

    return NextResponse.json(slot)
  } catch (error) {
    console.error("Error fetching timetable slot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string; slotId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if the slot exists
    const existingSlot = await prisma.timetableSlot.findUnique({
      where: {
        id: params.slotId,
        timetableId: params.id,
      },
    })

    if (!existingSlot) {
      return NextResponse.json({ message: "Timetable slot not found" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = timetableSlotSchema.parse(body)

    // Check for time conflicts (excluding this slot)
    const existingSlots = await prisma.timetableSlot.findMany({
      where: {
        timetableId: params.id,
        dayOfWeek: validatedData.dayOfWeek,
        id: {
          not: params.slotId,
        },
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

    // Update the slot
    const updatedSlot = await prisma.timetableSlot.update({
      where: {
        id: params.slotId,
      },
      data: validatedData,
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

    return NextResponse.json(updatedSlot)
  } catch (error) {
    console.error("Error updating timetable slot:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; slotId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if the slot exists
    const existingSlot = await prisma.timetableSlot.findUnique({
      where: {
        id: params.slotId,
        timetableId: params.id,
      },
    })

    if (!existingSlot) {
      return NextResponse.json({ message: "Timetable slot not found" }, { status: 404 })
    }

    // Delete the slot
    await prisma.timetableSlot.delete({
      where: {
        id: params.slotId,
      },
    })

    return NextResponse.json({ message: "Timetable slot deleted successfully" })
  } catch (error) {
    console.error("Error deleting timetable slot:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
