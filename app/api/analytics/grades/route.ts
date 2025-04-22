import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const lecturerId = url.searchParams.get("lecturerId")
    const studentId = url.searchParams.get("studentId")

    // Get active semester
    const activeSemester = await db.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
    }

    // Note: In a real app, you would have a grades model to fetch actual grade data
    // This is a simplified version that generates simulated grade data

    if (lecturerId) {
      // Get courses taught by lecturer in active semester
      const lecturerCourses = await db.lecturerCourse.findMany({
        where: {
          lecturerId,
          semesterId: activeSemester.id,
        },
        include: {
          course: true,
        },
      })

      // Generate simulated grade data for each course
      const courses = lecturerCourses.map((lecturerCourse) => {
        // Generate random grade statistics
        const averageGrade = 65 + Math.random() * 20 // Random average between 65-85
        const highestGrade = Math.min(100, averageGrade + 10 + Math.random() * 15) // Highest grade above average
        const passRate = 70 + Math.random() * 25 // Random pass rate between 70-95%

        return {
          code: lecturerCourse.course.code,
          title: lecturerCourse.course.title,
          averageGrade: Math.round(averageGrade),
          highestGrade: Math.round(highestGrade),
          passRate: Math.round(passRate),
        }
      })

      return NextResponse.json({ success: true, courses })
    } else if (studentId) {
      // Get courses taken by student in active semester
      const courseUploads = await db.courseUpload.findMany({
        where: {
          userId: studentId,
          semesterId: activeSemester.id,
          status: "APPROVED",
        },
        include: {
          course: true,
        },
      })

      // Generate simulated grade data for each course
      const courses = courseUploads.map((courseUpload) => {
        // Generate random grade
        const grade = 60 + Math.random() * 40 // Random grade between 60-100

        return {
          code: courseUpload.course.code,
          title: courseUpload.course.title,
          grade: Math.round(grade),
          letterGrade: getLetterGrade(Math.round(grade)),
          status: Math.round(grade) >= 60 ? "PASS" : "FAIL",
        }
      })

      return NextResponse.json({ success: true, courses })
    } else {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching grade data:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching grade data" },
      { status: 500 },
    )
  }
}

// Helper function to convert numeric grade to letter grade
function getLetterGrade(grade: number): string {
  if (grade >= 90) return "A"
  if (grade >= 80) return "B"
  if (grade >= 70) return "C"
  if (grade >= 60) return "D"
  return "F"
}
