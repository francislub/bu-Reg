import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const courseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  credits: z.number().min(1).max(6),
  description: z.string().optional(),
  departmentId: z.string(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      include: {
        department: true,
      },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
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
    const validatedData = courseSchema.parse(body)

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingCourse) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if updated code conflicts with another course
    if (validatedData.code !== existingCourse.code) {
      const codeConflict = await prisma.course.findUnique({
        where: {
          code: validatedData.code,
        },
      })

      if (codeConflict && codeConflict.id !== params.id) {
        return NextResponse.json({ message: "Course with this code already exists" }, { status: 409 })
      }
    }

    const updatedCourse = await prisma.course.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        department: true,
      },
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("Error updating course:", error)
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

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingCourse) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if course is being used in any semester
    const semesterCourses = await prisma.semesterCourse.findMany({
      where: {
        courseId: params.id,
      },
    })

    if (semesterCourses.length > 0) {
      return NextResponse.json({ message: "Cannot delete course that is assigned to a semester" }, { status: 400 })
    }

    await prisma.course.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
