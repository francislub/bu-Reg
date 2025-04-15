import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const timetableSchema = z.object({
  name: z.string().min(2),
  semesterId: z.string(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const timetable = await prisma.timetable.findUnique({
      where: {
        id: params.id,
      },
      include: {
        semester: true,
        slots: {
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
        },
      },
    })

    if (!timetable) {
      return NextResponse.json({ message: "Timetable not found" }, { status: 404 })
    }

    return NextResponse.json(timetable)
  } catch (error) {
    console.error("Error fetching timetable:", error)
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
    const validatedData = timetableSchema.parse(body)

    // Check if the timetable exists
    const existingTimetable = await prisma.timetable.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingTimetable) {
      return NextResponse.json({ message: "Timetable not found" }, { status: 404 })
    }

    // Update the timetable
    const updatedTimetable = await prisma.timetable.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        semester: true,
        slots: {
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
        },
      },
    })

    return NextResponse.json(updatedTimetable)
  } catch (error) {
    console.error("Error updating timetable:", error)
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

    // Check if the timetable exists
    const existingTimetable = await prisma.timetable.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingTimetable) {
      return NextResponse.json({ message: "Timetable not found" }, { status: 404 })
    }

    // Delete all slots first
    await prisma.timetableSlot.deleteMany({
      where: {
        timetableId: params.id,
      },
    })

    // Delete the timetable
    await prisma.timetable.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Timetable deleted successfully" })
  } catch (error) {
    console.error("Error deleting timetable:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
