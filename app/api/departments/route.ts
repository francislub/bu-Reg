import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

// Schema for creating departments
const departmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }

    const departments = await prisma.department.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
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

    // Transform the response to match the expected format
    const formattedDepartments = departments.map((dept) => ({
      ...dept,
      _count: {
        courses: dept._count.courses,
        staff: dept._count.departmentStaff,
      },
    }))

    return NextResponse.json(formattedDepartments)
  } catch (error) {
    console.error("Error fetching departments:", error)
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
    const validatedData = departmentSchema.parse(body)

    // Check if department code already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [{ code: validatedData.code }, { name: validatedData.name }],
      },
    })

    if (existingDepartment) {
      return NextResponse.json({ message: "Department with this code or name already exists" }, { status: 409 })
    }

    const department = await prisma.department.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        description: validatedData.description || null,
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

    // Transform the response to match the expected format
    const formattedDepartment = {
      ...department,
      _count: {
        courses: department._count.courses,
        staff: department._count.departmentStaff,
      },
    }

    return NextResponse.json(formattedDepartment, { status: 201 })
  } catch (error) {
    console.error("Error creating department:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
