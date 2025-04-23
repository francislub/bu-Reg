import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Student ID is required" }, { status: 400 })
    }

    // Check if user has permission to view this student's registrations
    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "REGISTRAR" &&
      session.user.role !== "STAFF" &&
      session.user.id !== studentId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to view this student's registrations" },
        { status: 403 },
      )
    }

    const registrations = await db.courseRegistration.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        course: true,
        semester: true,
        approvals: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      registrations,
    })
  } catch (error) {
    console.error("Error fetching student registrations:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch registrations" }, { status: 500 })
  }
}
