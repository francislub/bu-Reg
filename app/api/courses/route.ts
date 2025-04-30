import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all courses with their departments
    const courses = await db.course.findMany({
      include: {
        department: true,
        semesterCourses: {
          include: {
            semester: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    })

    // Also fetch departments for the dropdown
    const departments = await db.department.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      courses,
      departments,
    })
  } catch (error) {
    console.error("Error in courses API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.role !== "STAFF")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.code || !data.title || !data.credits || !data.departmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Check if course with same code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        code: data.code,
        NOT: data.id ? { id: data.id } : undefined,
      },
    })

    if (existingCourse) {
      return NextResponse.json(
        {
          success: false,
          error: "Course with this code already exists",
        },
        { status: 400 },
      )
    }

    // Create or update course
    let course
    if (data.id) {
      course = await db.course.update({
        where: { id: data.id },
        data: {
          code: data.code,
          title: data.title,
          credits: Number.parseInt(data.credits),
          departmentId: data.departmentId,
          description: data.description,
        },
      })
    } else {
      course = await db.course.create({
        data: {
          code: data.code,
          title: data.title,
          credits: Number.parseInt(data.credits),
          departmentId: data.departmentId,
          description: data.description,
        },
      })
    }

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error("Error creating/updating course:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create/update course",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
