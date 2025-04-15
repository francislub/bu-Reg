import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const lecturerCourseSchema = z.object({
  lecturerId: z.string(),
  courseId: z.string(),
  semesterId: z.string(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const lecturerCourse = await prisma.lecturerCourse.findUnique({
      where: {
        id: params.id,
      },
      include: {
        lecturer: {
          include: {
            profile: true,
            departmentStaff: {
              include: {
                department: true,
              },
            },
          },
        },
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
    })

    if (!lecturerCourse) {
      return NextResponse.json({ message: "Lecturer course not found" }, { status: 404 })
    }

    // Transform the data to include department from departmentStaff
    const transformedData = {
      ...lecturerCourse,
      lecturer: {
        ...lecturerCourse.lecturer,
        department: lecturerCourse.lecturer.departmentStaff?.department,
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching lecturer course:", error)
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
    const validatedData = lecturerCourseSchema.parse(body)

    // Check if the lecturer course exists
    const existingLecturerCourse = await prisma.lecturerCourse.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingLecturerCourse) {
      return NextResponse.json({ message: "Lecturer course not found" }, { status: 404 })
    }

    // Check if the assignment already exists (excluding the current one)
    const duplicateAssignment = await prisma.lecturerCourse.findFirst({
      where: {
        lecturerId: validatedData.lecturerId,
        courseId: validatedData.courseId,
        semesterId: validatedData.semesterId,
        id: {
          not: params.id,
        },
      },
    })

    if (duplicateAssignment) {
      return NextResponse.json(
        { message: "This lecturer is already assigned to this course for the selected semester" },
        { status: 409 },
      )
    }

    // Update the lecturer course
    const updatedLecturerCourse = await prisma.lecturerCourse.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        lecturer: {
          include: {
            profile: true,
            departmentStaff: {
              include: {
                department: true,
              },
            },
          },
        },
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
    })

    return NextResponse.json(updatedLecturerCourse)
  } catch (error) {
    console.error("Error updating lecturer course:", error)
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

    // Check if the lecturer course exists
    const existingLecturerCourse = await prisma.lecturerCourse.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingLecturerCourse) {
      return NextResponse.json({ message: "Lecturer course not found" }, { status: 404 })
    }

    // Delete the lecturer course
    await prisma.lecturerCourse.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Lecturer course deleted successfully" })
  } catch (error) {
    console.error("Error deleting lecturer course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
