import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseUploadId, approverId, status, comments } = body

    // Check if course upload exists
    const courseUpload = await db.courseUpload.findUnique({
      where: { id: courseUploadId },
    })

    if (!courseUpload) {
      return NextResponse.json({ success: false, message: "Course upload not found" }, { status: 404 })
    }

    // Update course upload status
    await db.courseUpload.update({
      where: { id: courseUploadId },
      data: { status: status.toUpperCase() },
    })

    // Create approval record
    const approval = await db.courseApproval.create({
      data: {
        courseUploadId,
        approverId,
        status: status.toUpperCase(),
        comments,
      },
    })

    return NextResponse.json({ success: true, approval })
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during approval" }, { status: 500 })
  }
}
