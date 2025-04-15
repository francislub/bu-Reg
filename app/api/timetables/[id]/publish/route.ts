import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const publishSchema = z.object({
  isPublished: z.boolean(),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.REGISTRAR) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = publishSchema.parse(body)

    // Check if the timetable exists
    const existingTimetable = await prisma.timetable.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingTimetable) {
      return NextResponse.json({ message: "Timetable not found" }, { status: 404 })
    }

    // Update the timetable publish status
    const updatedTimetable = await prisma.timetable.update({
      where: {
        id: params.id,
      },
      data: {
        isPublished: validatedData.isPublished,
      },
      include: {
        semester: true,
      },
    })

    return NextResponse.json(updatedTimetable)
  } catch (error) {
    console.error("Error updating timetable publish status:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
