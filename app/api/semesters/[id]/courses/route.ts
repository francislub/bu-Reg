import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get("programId")

    let courses

    if (programId) {
      // Get courses for this semester filtered by program
      courses = await db.course.findMany({
        where: {
          semesterCourses: {
            some: {
              semesterId: params.id,
            },
          },
          programCourses: {
            some: {
              programId,
            },
          },
        },
        include: {
          department: true,
        },
        orderBy: {
          code: "asc",
        },
      })
    } else {
      // Get all courses for this semester
      courses = await db.course.findMany({
        where: {
          semesterCourses: {
            some: {
              semesterId: params.id,
            },
          },
        },
        include: {
          department: true,
        },
        orderBy: {
          code: "asc",
        },
      })
    }

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching semester courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
