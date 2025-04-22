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

    // Get active semester
    const activeSemester = await db.semester.findFirst({
      where: { isActive: true },
    })

    if (!activeSemester) {
      return NextResponse.json({ success: false, message: "No active semester found" }, { status: 404 })
    }

    // Get all departments with course uploads for the active semester
    const departments = await db.department.findMany({
      include: {
        courses: {
          include: {
            courseUploads: {
              where: {
                semesterId: activeSemester.id,
              },
            },
          },
        },
      },
    })

    // Calculate student count per department
    const departmentData = departments.map((department) => {
      // Count unique students across all courses in the department
      const studentIds = new Set()

      department.courses.forEach((course) => {
        course.courseUploads.forEach((upload) => {
          studentIds.add(upload.userId)
        })
      })

      return {
        name: department.name,
        students: studentIds.size,
      }
    })

    // Filter out departments with no students
    const filteredData = departmentData.filter((dept) => dept.students > 0)

    return NextResponse.json({ success: true, departments: filteredData })
  } catch (error) {
    console.error("Error fetching department data:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching department data" },
      { status: 500 },
    )
  }
}
