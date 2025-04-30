import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all courses with better error handling
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

      return NextResponse.json({ courses })
    } catch (dbError) {
      console.error("Database error fetching courses:", dbError)
      return NextResponse.json({ error: "Database error fetching courses", details: dbError.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in courses API route:", error)
    return NextResponse.json({ error: "Failed to fetch courses", details: error.message }, { status: 500 })
  }
}
