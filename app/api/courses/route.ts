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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId")
    const search = searchParams.get("search")

    const whereClause: any = {}

    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ]
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        department: true,
      },
      orderBy: {
        code: "asc",
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
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
    const validatedData = courseSchema.parse(body)

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        code: validatedData.code,
      },
    })

    if (existingCourse) {
      return NextResponse.json({ message: "Course with this code already exists" }, { status: 409 })
    }

    const course = await prisma.course.create({
      data: validatedData,
      include: {
        department: true,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
