import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only registrars and admins can access this endpoint
    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch pending course uploads
    const pendingUploads = await db.courseUpload.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
            semester: true,
          },
        },
        course: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ pendingUploads })
  } catch (error) {
    console.error("Error fetching pending approvals:", error)
    return NextResponse.json({ error: "Failed to fetch pending approvals" }, { status: 500 })
  }
}
