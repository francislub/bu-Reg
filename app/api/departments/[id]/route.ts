import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

// Schema for updating departments
const departmentUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
})

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const department = await prisma.department.findUnique({
      where: {
        id: params.id,
      },
      include: {
        _count: {
          select: {
            courses: true,
            departmentStaff: true,
          },
        },
      },
    })

    if (!department) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 })
    }

    // Transform the response to match the expected format
    const formattedDepartment = {
      ...department,
      _count: {
        courses: department._count.courses,
        staff: department._count.departmentStaff,
      },
    }

    return NextResponse.json(formattedDepartment)
  } catch (error) {
    console.error("Error fetching department:", error)
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
    const validatedData = departmentUpdateSchema.parse(body)

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingDepartment) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 })
    }

    // Check if the updated code or name conflicts with another department
    if (validatedData.code || validatedData.name) {
      const conflictingDepartment = await prisma.department.findFirst({
        where: {
          OR: [
            validatedData.code ? { code: validatedData.code } : {},
            validatedData.name ? { name: validatedData.name } : {},
          ],
          NOT: {
            id: params.id,
          },
        },
      })

      if (conflictingDepartment) {
        return NextResponse.json({ message: "Department with this code or name already exists" }, { status: 409 })
      }
    }

    // Update the department
    const department = await prisma.department.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        _count: {
          select: {
            courses: true,
            departmentStaff: true,
          },
        },
      },
    })

    // Transform the response to match the expected format
    const formattedDepartment = {
      ...department,
      _count: {
        courses: department._count.courses,
        staff: department._count.departmentStaff,
      },
    }

    return NextResponse.json(formattedDepartment)
  } catch (error) {
    console.error("Error updating department:", error)
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

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: params.id,
      },
      include: {
        courses: true,
        departmentStaff: true,
      },
    })

    if (!existingDepartment) {
      return NextResponse.json({ message: "Department not found" }, { status: 404 })
    }

    // Check if department has associated courses or staff
    if (existingDepartment.courses.length > 0 || existingDepartment.departmentStaff.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete department with associated courses or staff" },
        { status: 400 },
      )
    }

    // Delete the department
    await prisma.department.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("Error deleting department:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
