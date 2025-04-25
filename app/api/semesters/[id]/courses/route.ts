import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const semesterId = params.id

    const semesterCourses = await db.semesterCourse.findMany({
      where: {
        semesterId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      courses: semesterCourses.map((sc) => sc.course),
    })
  } catch (error) {
    console.error("Error fetching semester courses:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching semester courses" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const semesterId = params.id
    const body = await req.json()
    const { courseIds } = body

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ success: false, message: "Course IDs array is required" }, { status: 400 })
    }

    // Get existing semester courses
    const existingSemesterCourses = await db.semesterCourse.findMany({
      where: {
        semesterId,
      },
      select: {
        courseId: true,
      },
    })

    const existingCourseIds = existingSemesterCourses.map((sc) => sc.courseId)

    // Filter out courses that are already in the semester
    const newCourseIds = courseIds.filter((id) => !existingCourseIds.includes(id))

    // Add new courses to semester
    if (newCourseIds.length > 0) {
      await Promise.all(
        newCourseIds.map((courseId) =>
          db.semesterCourse.create({
            data: {
              semesterId,
              courseId,
            },
          }),
        ),
      )
    }

    return NextResponse.json({
      success: true,
      message: `Added ${newCourseIds.length} courses to semester`,
    })
  } catch (error) {
    console.error("Error adding courses to semester:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while adding courses to semester" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const semesterId = params.id
    const url = new URL(req.url)
    const courseId = url.searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 })
    }

    await db.semesterCourse.delete({
      where: {
        semesterId_courseId: {
          semesterId,
          courseId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Course removed from semester successfully",
    })
  } catch (error) {
    console.error("Error removing course from semester:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while removing course from semester" },
      { status: 500 },
    )
  }
}
