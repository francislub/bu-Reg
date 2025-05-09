import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const programId = url.searchParams.get("programId")
    const departmentId = url.searchParams.get("departmentId")

    if (!programId || !departmentId) {
      return NextResponse.json({ error: "Program ID and Department ID are required" }, { status: 400 })
    }

    // Get courses that are associated with the program and department
    const programCourses = await db.programCourse.findMany({
      where: {
        programId,
        course: {
          departmentId,
        },
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    })

    // Extract just the courses from the program courses
    const courses = programCourses.map((pc) => pc.course)

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error fetching courses by program and department:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
