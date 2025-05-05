import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Update the GET method to include program and semester associations
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const course = await db.course.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        programCourses: true,
        semesterCourses: {
          include: {
            semester: {
              include: {
                academicYear: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    // Check if another course with same code already exists
    const existingCourse = await db.course.findFirst({
      where: {
        code: data.code,
        NOT: {
          id: params.id,
        },
      },
    })

    if (existingCourse) {
      return NextResponse.json(
        {
          success: false,
          error: "Another course with this code already exists",
        },
        { status: 400 },
      )
    }

    const course = await db.course.update({
      where: { id: params.id },
      data: {
        code: data.code,
        title: data.title,
        credits: Number.parseInt(data.credits),
        departmentId: data.departmentId,
        description: data.description,
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.role !== "STAFF")
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: params.id },
      include: {
        semesterCourses: true,
        courseUploads: true,
      },
    })

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Delete related records first to avoid foreign key constraints
    if (course.semesterCourses.length > 0) {
      await db.semesterCourse.deleteMany({
        where: { courseId: params.id },
      })
    }

    if (course.courseUploads.length > 0) {
      await db.courseUpload.deleteMany({
        where: { courseId: params.id },
      })
    }

    // Now delete the course
    await db.course.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
