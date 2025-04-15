import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

// Schema for creating/updating calendar events
const calendarEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  date: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  type: z.enum(["registration", "exam", "holiday", "semester", "other"]),
  semesterId: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const semesterId = searchParams.get("semesterId")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const whereClause: any = {}

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    if (type) {
      whereClause.type = type
    }

    if (startDate) {
      whereClause.date = {
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      if (!whereClause.date) whereClause.date = {}
      whereClause.date.lte = new Date(endDate)
    }

    const events = await prisma.academicCalendarEvent.findMany({
      where: whereClause,
      orderBy: {
        date: "asc",
      },
      include: {
        semester: true,
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching academic calendar events:", error)
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
    const validatedData = calendarEventSchema.parse(body)

    const event = await prisma.academicCalendarEvent.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        date: new Date(validatedData.date),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        type: validatedData.type,
        semesterId: validatedData.semesterId,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating academic calendar event:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
