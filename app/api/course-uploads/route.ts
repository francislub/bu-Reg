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
    const userId = url.searchParams.get("userId")
    const semesterId = url.searchParams.get("semesterId")
    const status = url.searchParams.get("status")

    const where: any = {}
    if (userId) where.userId = userId
    if (semesterId) where.semesterId = semesterId
    if (status) where.status = status.toUpperCase()

    const courseUploads = await db.courseUpload.findMany({
      where,
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
        user: {
          include: {
            profile: true,
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
    console.error("Error fetching course uploads:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching course uploads" },
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
    const existingUpload = await db.courseUpload.findUnique({
      where: {
        registrationId_courseId: {
          registrationId,
          courseId,
        },
      },
    })

    if (existingUpload) {
      return NextResponse.json(
        { success: false, message: "Course is already uploaded for this registration" },
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
    console.error("Course upload error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during course upload" }, { status: 500 })
  }
}
