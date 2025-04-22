import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get all semesters with registration counts
    const semesters = await db.semester.findMany({
      orderBy: {
        startDate: "asc",
      },
      include: {
        registrations: true,
      },
    })

    // Calculate enrollment data
    const enrollmentData = semesters.map((semester, index) => {
      const previousSemester = index > 0 ? semesters[index - 1] : null
      const students = semester.registrations.length
      const previousStudents = previousSemester ? previousSemester.registrations.length : 0

      // Calculate new students (this is a simplification - in a real app you'd track this differently)
      const newStudents = Math.max(0, students - previousStudents)

      // Calculate growth rate
      const growthRate =
        previousStudents > 0 ? Math.round(((students - previousStudents) / previousStudents) * 100 * 10) / 10 : 0

      return {
        semester: semester.name,
        students,
        newStudents,
        growthRate,
      }
    })

    return NextResponse.json({ success: true, semesters: enrollmentData })
  } catch (error) {
    console.error("Error fetching enrollment data:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching enrollment data" },
      { status: 500 },
    )
  }
}
