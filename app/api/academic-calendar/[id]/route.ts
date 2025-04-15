import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

// Schema for updating calendar events
const calendarEventUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(["registration", "exam", "holiday", "semester", "other"]).optional(),
  semesterId: z.string().optional(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const event = await prisma.academicCalendarEvent.findUnique({
      where: {
        id: params.id,
      },
      include: {
        semester: true,
      },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching academic calendar event:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = calendarEventUpdateSchema.parse(body)

    // Check if event exists
    const existingEvent = await prisma.academicCalendarEvent.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    // Update the event
    const updatedEvent = await prisma.academicCalendarEvent.update({
      where: {
        id: params.id,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        type: validatedData.type,
        semesterId: validatedData.semesterId,
      },
      include: {
        semester: true,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating academic calendar event:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if event exists
    const existingEvent = await prisma.academicCalendarEvent.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    // Delete the event
    await prisma.academicCalendarEvent.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting academic calendar event:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
