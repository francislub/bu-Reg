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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isActive = searchParams.get("isActive")

    const whereClause: any = {}

    if (isActive === "true") {
      whereClause.isActive = true
    }

    const semesters = await prisma.semester.findMany({
      where: whereClause,
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    })

    return NextResponse.json(semesters)
  } catch (error) {
    console.error("Error fetching semesters:", error)
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
    const validatedData = semesterSchema.parse(body)

    // Check if semester name already exists
    const existingSemester = await prisma.semester.findUnique({
      where: {
        name: validatedData.name,
      },
    })

    if (existingSemester) {
      return NextResponse.json({ message: "Semester with this name already exists" }, { status: 409 })
    }

    // If this semester is active, deactivate all other semesters
    if (validatedData.isActive) {
      await prisma.semester.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })
    }

    const semester = await prisma.semester.create({
      data: {
        name: validatedData.name,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        registrationDeadline: new Date(validatedData.registrationDeadline),
        courseUploadDeadline: new Date(validatedData.courseUploadDeadline),
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(semester, { status: 201 })
  } catch (error) {
    console.error("Error creating semester:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
