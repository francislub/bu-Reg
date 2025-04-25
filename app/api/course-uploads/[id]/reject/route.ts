import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const courseUploadId = params.id
    const body = await req.json()
    const { comments } = body

    // Check if course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
    })

    if (!courseUpload) {
      return NextResponse.json({ success: false, message: "Course registration not found" }, { status: 404 })
    }

    // Update course upload status and create approval record
    const updatedCourseUpload = await db.courseUpload.update({
      where: {
        id: courseUploadId,
      },
      data: {
        status: "REJECTED",
        approvals: {
          create: {
            approverId: session.user.id,
            status: "REJECTED",
            comments,
          },
        },
      },
      include: {
        course: true,
        user: true,
        semester: true,
        approvals: true,
      },
    })

    return NextResponse.json({ success: true, courseUpload: updatedCourseUpload })
  } catch (error) {
    console.error("Error rejecting course registration:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while rejecting course registration" },
      { status: 500 },
    )
  }
}
