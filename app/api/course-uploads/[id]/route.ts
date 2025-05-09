import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get the course upload to check ownership
    const courseUpload = await db.courseUpload.findUnique({
      where: { id },
    })

    if (!courseUpload) {
      return NextResponse.json({ error: "Course upload not found" }, { status: 404 })
    }

    // Check if user is authorized to delete this course upload
    if (session.user.id !== courseUpload.userId && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ error: "Unauthorized to delete this course upload" }, { status: 403 })
    }

    // Check if course upload is already approved
    if (courseUpload.status === "APPROVED") {
      return NextResponse.json(
        {
          error: "Cannot delete an approved course registration. Please contact the registrar.",
        },
        { status: 400 },
      )
    }

    // Delete the course upload
    await db.courseUpload.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Course registration deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting course upload:", error)
    return NextResponse.json({ error: "Failed to delete course registration" }, { status: 500 })
  }
}
