import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get departments with student and course counts
    const departments = await db.department.findMany({
      include: {
        _count: {
          select: {
            students: true,
            courses: true,
          },
        },
      },
    })

    // Format the data for the frontend
    const departmentStats = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      studentCount: dept._count.students,
      courseCount: dept._count.courses,
    }))

    return NextResponse.json({
      success: true,
      departments: departmentStats,
    })
  } catch (error) {
    console.error("Error fetching department analytics:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching department analytics" },
      { status: 500 },
    )
  }
}
