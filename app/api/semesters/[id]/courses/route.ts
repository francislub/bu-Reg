import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const semesterId = params.id
    if (!semesterId) {
      return NextResponse.json({ success: false, error: "Semester ID is required" }, { status: 400 })
    }

    // Get the program ID from the query
    const url = new URL(request.url)
    const programId = url.searchParams.get("programId")

    // If no program ID is provided but the user is a student, get their program
    let studentProgramId = programId
    if (!studentProgramId && session.user.role === "STUDENT") {
      const profile = await db.profile.findFirst({
        where: {
          user: {
            id: session.user.id,
          },
        },
      })

      if (profile?.programId) {
        studentProgramId = profile.programId
      }
    }

    // Fetch the semester with academic year info
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: { academicYear: true },
    })

    if (!semester) {
      return NextResponse.json({ success: false, error: "Semester not found" }, { status: 404 })
    }

    const query: any = {
      where: {
        semesterId: semesterId,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    }

    // If we have a program ID (either from query or student profile), filter by program as well
    let courses = []

    if (studentProgramId) {
      // First, find courses that are offered in this semester
      const semesterCourses = await db.semesterCourse.findMany({
        where: {
          semesterId: semesterId,
        },
        include: {
          course: true,
        },
      })

      // Get the IDs of all courses offered in this semester
      const semesterCourseIds = semesterCourses.map((sc) => sc.courseId)

      // Then find courses that are part of the student's program AND offered this semester
      courses = await db.course.findMany({
        where: {
          id: {
            in: semesterCourseIds,
          },
          programCourses: {
            some: {
              programId: studentProgramId,
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
      // For admin/staff, show all courses for this semester
      const semesterCourses = await db.semesterCourse.findMany({
        where: {
          semesterId: semesterId,
        },
        include: {
          course: {
            include: {
              department: true,
            },
          },
        },
      })

      // Extract courses from semesterCourses for consistent format
      courses = semesterCourses.map((sc) => sc.course)
    }

    return NextResponse.json({
      success: true,
      semester,
      courses,
    })
  } catch (error) {
    console.error("Error fetching semester courses:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch semester courses",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
