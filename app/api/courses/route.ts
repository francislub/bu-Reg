import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const courses = await db.course.findMany({
      include: {
        department: true,
        semesterCourses: {
          include: {
            semester: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching courses" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { code, title, credits, description, departmentId } = body

    // Check if course with same code already exists
    const existingCourse = await db.course.findUnique({
      where: { code },
    })

    if (existingCourse) {
      return NextResponse.json({ success: false, message: "Course with this code already exists" }, { status: 400 })
    }

    const course = await db.course.create({
      data: {
        code,
        title,
        credits,
        description,
        departmentId,
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error("Course creation error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during course creation" }, { status: 500 })
  }
}
