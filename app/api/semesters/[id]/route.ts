import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const semesterSchema = z.object({
  name: z.string().min(2),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  registrationDeadline: z.string().min(1),
  courseUploadDeadline: z.string().min(1),
  isActive: z.boolean().default(false),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const semester = await prisma.semester.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!semester) {
      return NextResponse.json({ message: "Semester not found" }, { status: 404 })
    }

    return NextResponse.json(semester)
  } catch (error) {
    console.error("Error fetching semester:", error)
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
    const validatedData = semesterSchema.parse(body)

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingSemester) {
      return NextResponse.json({ message: "Semester not found" }, { status: 404 })
    }

    // Check if name conflicts with another semester
    if (validatedData.name !== existingSemester.name) {
      const nameConflict = await prisma.semester.findUnique({
        where: {
          name: validatedData.name,
        },
      })

      if (nameConflict && nameConflict.id !== params.id) {
        return NextResponse.json({ message: "Semester with this name already exists" }, { status: 409 })
      }
    }

    // If this semester is being activated, deactivate all other semesters
    if (validatedData.isActive && !existingSemester.isActive) {
      await prisma.semester.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })
    }

    const updatedSemester = await prisma.semester.update({
      where: {
        id: params.id,
      },
      data: {
        name: validatedData.name,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        registrationDeadline: new Date(validatedData.registrationDeadline),
        courseUploadDeadline: new Date(validatedData.courseUploadDeadline),
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(updatedSemester)
  } catch (error) {
    console.error("Error updating semester:", error)
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

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingSemester) {
      return NextResponse.json({ message: "Semester not found" }, { status: 404 })
    }

    // Check if semester has associated data
    const semesterCourses = await prisma.semesterCourse.count({
      where: {
        semesterId: params.id,
      },
    })

    const registrations = await prisma.registration.count({
      where: {
        semesterId: params.id,
      },
    })

    if (semesterCourses > 0 || registrations > 0) {
      return NextResponse.json(
        { message: "Cannot delete semester with associated courses or registrations" },
        { status: 400 },
      )
    }

    await prisma.semester.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Semester deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting semester:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
