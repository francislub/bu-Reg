import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const semesterId = params.id
    const { searchParams } = new URL(req.url)
    const programId = searchParams.get("programId")

    if (!programId) {
      return new NextResponse("Program ID is required", { status: 400 })
    }

    // Get all courses for the semester
    const semesterCourses = await db.semesterCourse.findMany({
      where: {
        semesterId,
      },
      include: {
        course: true,
      },
    })

    // Get all courses for the program
    const programCourses = await db.programCourse.findMany({
      where: {
        programId,
      },
      include: {
        course: true,
      },
    })

    // Filter semester courses to only include those that are part of the program
    const availableCourses = semesterCourses
      .filter((sc) => programCourses.some((pc) => pc.courseId === sc.courseId))
      .map((sc) => sc.course)

    return NextResponse.json(availableCourses)
  } catch (error) {
    console.error("[SEMESTER_COURSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
