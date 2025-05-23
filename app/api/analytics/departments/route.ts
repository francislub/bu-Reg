import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get all departments with their associated programs and courses
    const departments = await db.department.findMany({
      include: {
        programs: true,
        courses: true,
        _count: {
          select: {
            programs: true,
            courses: true,
          },
        },
      },
    })

    // Format the data for the frontend
    const formattedDepartments = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      programsCount: dept._count.programs,
      coursesCount: dept._count.courses,
      // Calculate student count (this is an approximation as students are linked to programs)
      studentsCount: 0, // This would need a more complex query to get accurate numbers
    }))

    // For each department, try to get student count based on profiles with programs in that department
    for (const dept of formattedDepartments) {
      const programIds = departments.find((d) => d.id === dept.id)?.programs.map((p) => p.id) || []

      if (programIds.length > 0) {
        const studentCount = await db.profile.count({
          where: {
            programId: {
              in: programIds,
            },
            user: {
              role: "STUDENT",
            },
          },
        })

        dept.studentsCount = studentCount
      }
    }

    return NextResponse.json({ success: true, departments: formattedDepartments })
  } catch (error) {
    console.error("Error fetching department analytics:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch department analytics" }, { status: 500 })
  }
}
