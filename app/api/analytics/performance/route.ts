import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get departments
    const departments = await db.department.findMany()

    // For a real application, you would fetch actual performance data
    // This is a placeholder that generates random performance data for each department
    const performanceData = departments.map((dept) => {
      // Generate random values for demonstration
      const gpa = Number.parseFloat((2.5 + Math.random() * 1.5).toFixed(2)) // GPA between 2.5 and 4.0
      const attendance = Number.parseFloat((70 + Math.random() * 30).toFixed(1)) // Attendance between 70% and 100%
      const passRate = Number.parseFloat((75 + Math.random() * 25).toFixed(1)) // Pass rate between 75% and 100%

      return {
        department: dept.name,
        gpa,
        attendance,
        passRate,
      }
    })

    return NextResponse.json({
      success: true,
      departments: performanceData,
    })
  } catch (error) {
    console.error("Error fetching performance analytics:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch performance analytics",
      },
      { status: 500 },
    )
  }
}
