import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "REGISTRAR") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const url = new URL(req.url)
    const semesterId = url.searchParams.get("semesterId")
    const courseId = url.searchParams.get("courseId")
    const status = url.searchParams.get("status")

    if (!semesterId) {
      return new NextResponse(JSON.stringify({ error: "Semester ID is required" }), {
        status: 400,
      })
    }

    // Build where clause based on parameters
    const whereClause: any = {
      semesterId,
    }

    if (courseId) {
      whereClause.courseId = courseId
    }

    if (status) {
      whereClause.status = status
    }

    // Get course uploads
    const courseUploads = await db.courseUpload.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        approvals: {
          include: {
            approver: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate summary statistics
    const totalCourseUploads = courseUploads.length
    const approvedCourseUploads = courseUploads.filter((cu) => cu.status === "APPROVED").length
    const pendingCourseUploads = courseUploads.filter((cu) => cu.status === "PENDING").length
    const rejectedCourseUploads = courseUploads.filter((cu) => cu.status === "REJECTED").length

    // Group by course
    const courseCounts: Record<string, number> = {}
    courseUploads.forEach((cu) => {
      const courseCode = cu.course.code
      courseCounts[courseCode] = (courseCounts[courseCode] || 0) + 1
    })

    // Get semester details
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: {
        academicYear: true,
      },
    })

    return NextResponse.json({
      semester,
      summary: {
        totalCourseUploads,
        approvedCourseUploads,
        pendingCourseUploads,
        rejectedCourseUploads,
        courseCounts,
      },
      courseUploads,
    })
  } catch (error) {
    console.error("Error generating course registration report:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to generate report" }), {
      status: 500,
    })
  }
}
