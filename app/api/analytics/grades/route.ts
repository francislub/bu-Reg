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
    const userId = url.searchParams.get("userId") || session.user.id

    // Get current semester
    const currentSemester = await db.semester.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })

    if (!currentSemester) {
      return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
    }

    // Get grades for the user in the current semester
    const grades = await db.grade.findMany({
      where: {
        userId,
        semesterId: currentSemester.id,
      },
      include: {
        course: true,
      },
    })

    // Get class averages
    const courseIds = grades.map((grade) => grade.courseId)

    // For each course, calculate the class average
    const courseAverages = await Promise.all(
      courseIds.map(async (courseId) => {
        const courseGrades = await db.grade.findMany({
          where: {
            courseId,
            semesterId: currentSemester.id,
          },
        })

        const total = courseGrades.reduce((sum, grade) => sum + grade.score, 0)
        const average = courseGrades.length > 0 ? Number.parseFloat((total / courseGrades.length).toFixed(1)) : 0

        return { courseId, average }
      }),
    )

    // Map the averages to a lookup object
    const averageLookup = courseAverages.reduce(
      (acc, item) => {
        acc[item.courseId] = item.average
        return acc
      },
      {} as Record<string, number>,
    )

    // Format the data for the chart
    const data = grades.map((grade) => ({
      course: grade.course.code,
      score: grade.score,
      average: averageLookup[grade.courseId] || 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching grade analytics:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching grade analytics" },
      { status: 500 },
    )
  }
}
