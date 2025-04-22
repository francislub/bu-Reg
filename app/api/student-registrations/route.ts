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
    const studentId = url.searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Student ID is required" }, { status: 400 })
    }

    // Get all course uploads (registrations) for the student
    const registrations = await db.courseUpload.findMany({
      where: {
        userId: studentId,
      },
      include: {
        course: {
          include: {
            department: true,
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

    return NextResponse.json({ success: true, registrations })
  } catch (error) {
    console.error("Error fetching student registrations:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching student registrations" },
      { status: 500 },
    )
  }
}
