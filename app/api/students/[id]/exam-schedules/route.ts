import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only allow students to access their own exam schedules
    if (session.user.id !== params.id && session.user.role !== "REGISTRAR" && session.user.role !== "STAFF") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const semesterId = searchParams.get("semesterId")

    // Get the semester to use
    let semesterToUse = semesterId
    if (!semesterToUse) {
      const activeSemester = await prisma.semester.findFirst({
        where: { isActive: true },
      })
      if (activeSemester) {
        semesterToUse = activeSemester.id
      }
    }

    if (!semesterToUse) {
      return NextResponse.json({ message: "No active semester found" }, { status: 404 })
    }

    // Get the student's registered courses for the semester
    const registeredCourses = await prisma.courseUpload.findMany({
      where: {
        userId: params.id,
        semesterId: semesterToUse,
        status: "APPROVED",
      },
      select: {
        courseId: true,
      },
    })

    const courseIds = registeredCourses.map((course) => course.courseId)

    if (courseIds.length === 0) {
      return NextResponse.json([])
    }

    // Get the exam schedules for the student's courses
    const examSchedules = await prisma.examSchedule.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
        semesterId: semesterToUse,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json(examSchedules)
  } catch (error) {
    console.error("Error fetching student exam schedules:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
