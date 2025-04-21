import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      include: {
        profile: true,
        registrations: {
          include: {
            semester: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    return NextResponse.json({ success: true, students })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching students" }, { status: 500 })
  }
}
