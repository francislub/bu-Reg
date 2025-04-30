import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get departments with course counts
    const departments = await db.department.findMany({
      include: {
        courses: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            courses: true,
            programs: true,
          },
        },
      },
    })

    // Get student counts per department
    const studentCounts = await db.profile.groupBy({
      by: ["departmentId"],
      _count: {
        _all: true,
      },
    })

    // Create a map of department IDs to student counts
    const departmentStudentCounts = new Map()
    studentCounts.forEach((count) => {
      if (count.departmentId) {
        departmentStudentCounts.set(count.departmentId, count._count._all)
      }
    })

    // Format the response
    const formattedDepartments = departments.map((dept) => ({
      name: dept.name,
      students: departmentStudentCounts.get(dept.id) || 0,
      courses: dept._count.courses,
      programs: dept._count.programs,
    }))

    return NextResponse.json({
      success: true,
      departments: formattedDepartments,
    })
  } catch (error) {
    console.error("Error fetching department analytics:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch department analytics",
      },
      { status: 500 },
    )
  }
}
