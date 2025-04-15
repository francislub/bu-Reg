import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.STAFF) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const courseId = params.id

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json({ message: "No active semester found" }, { status: 404 })
    }

    // Find students enrolled in this course for the active semester
    const courseUploads = await prisma.courseUpload.findMany({
      where: {
        courseId,
        semesterId: activeSemester.id,
        status: "APPROVED",
      },
      select: {
        userId: true,
      },
    })

    const studentIds = courseUploads.map((upload) => upload.userId)

    if (studentIds.length === 0) {
      return NextResponse.json([]) // No students enrolled
    }

    // Get student details
    const students = await prisma.user.findMany({
      where: {
        id: {
          in: studentIds,
        },
        role: userRoles.STUDENT,
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students for course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
