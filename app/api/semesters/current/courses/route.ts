import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId")

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: {
        isActive: true,
      },
    })

    if (!activeSemester) {
      return NextResponse.json([])
    }

    // Build where clause
    const whereClause: any = {
      semesterId: activeSemester.id,
    }

    if (departmentId) {
      whereClause.course = {
        departmentId,
      }
    }

    // Get semester courses
    const semesterCourses = await prisma.semesterCourse.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
      orderBy: {
        course: {
          code: "asc",
        },
      },
    })

    return NextResponse.json(semesterCourses)
  } catch (error) {
    console.error("Error fetching semester courses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
