import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { registrationId, courseId, userId, semesterId } = body

    // Validate required fields
    if (!registrationId || !courseId || !userId || !semesterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user is authorized to register courses for this user
    if (session.user.id !== userId && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ error: "Unauthorized to register courses for this user" }, { status: 403 })
    }

    // Check if course upload already exists
    const existingCourseUpload = await db.courseUpload.findFirst({
      where: {
        registrationId,
        courseId,
        userId,
        semesterId,
      },
    })

    if (existingCourseUpload) {
      return NextResponse.json({
        courseUpload: existingCourseUpload,
        message: "Course already registered",
      })
    }

    // Calculate total credits for this registration
    const existingCourseUploads = await db.courseUpload.findMany({
      where: {
        registrationId,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
      include: {
        course: true,
      },
    })

    const existingCredits = existingCourseUploads.reduce((total, upload) => total + upload.course.credits, 0)

    // Get the course to check its credits
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if adding this course would exceed the credit limit (24)
    if (existingCredits + course.credits > 24) {
      return NextResponse.json(
        {
          error: "Adding this course would exceed the maximum of 24 credits",
        },
        { status: 400 },
      )
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

    return NextResponse.json({
      courseUpload,
      message: "Course registration submitted successfully",
    })
  } catch (error) {
    console.error("Error creating course upload:", error)
    return NextResponse.json({ error: "Failed to register course" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const semesterId = url.searchParams.get("semesterId")
    const status = url.searchParams.get("status")

    // Build where clause
    const where: any = {}
    if (userId) where.userId = userId
    if (semesterId) where.semesterId = semesterId
    if (status) where.status = status

    // If not admin or registrar, only allow viewing own course uploads
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized to view these course uploads" }, { status: 403 })
    }

    const courseUploads = await db.courseUpload.findMany({
      where,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        registration: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ courseUploads })
  } catch (error) {
    console.error("Error fetching course uploads:", error)
    return NextResponse.json({ error: "Failed to fetch course uploads" }, { status: 500 })
  }
}
