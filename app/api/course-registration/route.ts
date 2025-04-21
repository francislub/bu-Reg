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
    const semesterId = url.searchParams.get("semesterId")

    if (!semesterId) {
      return NextResponse.json({ success: false, message: "Semester ID is required" }, { status: 400 })
    }

    // Get courses registered by the student
    const courseUploads = await db.courseUpload.findMany({
      where: {
        userId,
        semesterId,
      },
      include: {
        course: {
          include: {
            department: true,
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
    })

    return NextResponse.json({ success: true, courseUploads })
  } catch (error) {
    console.error("Error fetching course registrations:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching course registrations" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { registrationId, courseId, userId, semesterId } = body

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

export async function DELETE(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const courseUploadId = url.searchParams.get("id")

    if (!courseUploadId) {
      return NextResponse.json({ success: false, message: "Course upload ID is required" }, { status: 400 })
    }

    // Check if course upload exists and belongs to the user
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
    })

    if (!courseUpload) {
      return NextResponse.json({ success: false, message: "Course registration not found" }, { status: 404 })
    }

    if (courseUpload.userId !== session.user.id && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Check if course is already approved
    if (courseUpload.status === "APPROVED" && session.user.role !== "REGISTRAR") {
      return NextResponse.json(
        { success: false, message: "Cannot drop an approved course. Please contact the registrar." },
        { status: 400 },
      )
    }

    // Delete course upload
    await db.courseUpload.delete({
      where: { id: courseUploadId },
    })

    return NextResponse.json({ success: true, message: "Course dropped successfully" })
  } catch (error) {
    console.error("Error dropping course:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while dropping the course" },
      { status: 500 },
    )
  }
}
