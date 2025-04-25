import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const programId = params.id

    const programCourses = await db.programCourse.findMany({
      where: {
        programId,
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
      courses: programCourses.map((pc) => pc.course),
    })
  } catch (error) {
    console.error("Error fetching program courses:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching program courses" },
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

    const programId = params.id
    const body = await req.json()
    const { courseIds } = body

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ success: false, message: "Course IDs array is required" }, { status: 400 })
    }

    // Get existing program courses
    const existingProgramCourses = await db.programCourse.findMany({
      where: {
        programId,
      },
      select: {
        courseId: true,
      },
    })

    const existingCourseIds = existingProgramCourses.map((pc) => pc.courseId)

    // Filter out courses that are already in the program
    const newCourseIds = courseIds.filter((id) => !existingCourseIds.includes(id))

    // Add new courses to program
    if (newCourseIds.length > 0) {
      await Promise.all(
        newCourseIds.map((courseId) =>
          db.programCourse.create({
            data: {
              programId,
              courseId,
            },
          }),
        ),
      )
    }

    return NextResponse.json({
      success: true,
      message: `Added ${newCourseIds.length} courses to program`,
    })
  } catch (error) {
    console.error("Error adding courses to program:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while adding courses to program" },
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

    const programId = params.id
    const url = new URL(req.url)
    const courseId = url.searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID is required" }, { status: 400 })
    }

    await db.programCourse.delete({
      where: {
        programId_courseId: {
          programId,
          courseId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Course removed from program successfully",
    })
  } catch (error) {
    console.error("Error removing course from program:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while removing course from program" },
      { status: 500 },
    )
  }
}
