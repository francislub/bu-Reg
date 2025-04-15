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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const semesterId = searchParams.get("semesterId")

    const whereClause: any = {}

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    const timetables = await prisma.timetable.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(timetables)
  } catch (error) {
    console.error("Error fetching timetables:", error)
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
    const validatedData = timetableSchema.parse(body)

    // Create the timetable
    const timetable = await prisma.timetable.create({
      data: validatedData,
      include: {
        semester: true,
        slots: true,
      },
    })

    return NextResponse.json(timetable, { status: 201 })
  } catch (error) {
    console.error("Error creating timetable:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
