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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lecturerId = searchParams.get("lecturerId")
    const courseId = searchParams.get("courseId")
    const semesterId = searchParams.get("semesterId")

    const whereClause: any = {}

    if (lecturerId) {
      whereClause.lecturerId = lecturerId
    }

    if (courseId) {
      whereClause.courseId = courseId
    }

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    const lecturerCourses = await prisma.lecturerCourse.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform the data to include department from departmentStaff
    const transformedData = lecturerCourses.map((lc) => ({
      ...lc,
      lecturer: {
        ...lc.lecturer,
        department: lc.lecturer.departmentStaff?.department,
      },
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching lecturer courses:", error)
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
    const validatedData = lecturerCourseSchema.parse(body)

    // Check if the assignment already exists
    const existingAssignment = await prisma.lecturerCourse.findFirst({
      where: {
        lecturerId: validatedData.lecturerId,
        courseId: validatedData.courseId,
        semesterId: validatedData.semesterId,
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { message: "This lecturer is already assigned to this course for the selected semester" },
        { status: 409 },
      )
    }

    // Create the lecturer course assignment
    const lecturerCourse = await prisma.lecturerCourse.create({
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

    return NextResponse.json(lecturerCourse, { status: 201 })
  } catch (error) {
    console.error("Error creating lecturer course:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
