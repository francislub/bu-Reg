import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester") || "fall2023"
    const academicYear = searchParams.get("academicYear") || "2023-2024"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get faculty with course counts and student counts
    const faculty = await prisma.faculty.findMany({
      include: {
        courses: {
          where: {
            semester,
            academicYear,
          },
          select: {
            id: true,
            code: true,
            title: true,
            currentEnrolled: true,
          },
        },
      },
    })

    // Calculate teaching load
    const facultyLoad = faculty
      .map((f) => {
        const courseCount = f.courses.length
        const studentCount = f.courses.reduce((sum, course) => sum + course.currentEnrolled, 0)

        return {
          id: f.id,
          name: f.name,
          department: f.department,
          courseCount,
          studentCount,
          averageClassSize: courseCount > 0 ? Math.round(studentCount / courseCount) : 0,
        }
      })
      .filter((f) => f.courseCount > 0) // Only include faculty with courses
      .sort((a, b) => b.studentCount - a.studentCount) // Sort by student count
      .slice(0, limit)

    return NextResponse.json(facultyLoad)
  } catch (error) {
    console.error("Error fetching faculty load:", error)
    return NextResponse.json({ error: "Failed to fetch faculty load" }, { status: 500 })
  }
}

