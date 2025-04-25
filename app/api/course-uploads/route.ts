import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const semesterId = url.searchParams.get("semesterId")
    const userId = url.searchParams.get("userId") || session.user.id
    const status = url.searchParams.get("status")

    // Build where clause based on parameters
    const whereClause: any = {}

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    if (userId) {
      whereClause.userId = userId
    }

    if (status) {
      whereClause.status = status
    }

    // Check if user has permission to view course uploads
    if (session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

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
        semester: true,
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

    return NextResponse.json({ success: true, courseUploads })
  } catch (error) {
    console.error("Error fetching course uploads:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching course uploads" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { registrationId, courseId, userId, semesterId } = body

    // Validate required fields
    if (!registrationId || !courseId || !userId || !semesterId) {
      return NextResponse.json(
        { success: false, message: "Registration ID, course ID, user ID, and semester ID are required" },
        { status: 400 },
      )
    }

    // Check if course upload already exists
    const existingCourseUpload = await db.courseUpload.findFirst({
      where: {
        userId,
        semesterId,
        courseId,
      },
    })

    if (existingCourseUpload) {
      return NextResponse.json(
        { success: false, message: "You are already registered for this course" },
        { status: 400 },
      )
    }

    // Get current total credit hours for this semester
    const currentCourseUploads = await db.courseUpload.findMany({
      where: {
        userId,
        semesterId,
      },
      include: {
        course: true,
      },
    })

    // Get the course to be added
    const courseToAdd = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!courseToAdd) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 })
    }

    // Calculate total credit hours including the new course
    const currentCreditHours = currentCourseUploads.reduce((total, cu) => total + cu.course.credits, 0)
    const newTotalCreditHours = currentCreditHours + courseToAdd.credits

    // Check if adding this course would exceed the maximum credit hours (24)
    if (newTotalCreditHours > 24) {
      return NextResponse.json(
        {
          success: false,
          message: `Adding this course would exceed the maximum of 24 credit hours. Current: ${currentCreditHours}, Course: ${courseToAdd.credits}`,
        },
        { status: 400 },
      )
    }

    // Check if the course has the minimum required credit hours (3)
    if (courseToAdd.credits < 3) {
      return NextResponse.json({ success: false, message: "Course must have at least 3 credit hours" }, { status: 400 })
    }

    // Create course upload
    const courseUpload = await db.courseUpload.create({
      data: {
        registrationId,
        courseId,
        userId,
        semesterId,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true, courseUpload })
  } catch (error) {
    console.error("Error adding course:", error)
    return NextResponse.json({ success: false, message: "An error occurred while adding the course" }, { status: 500 })
  }
}
