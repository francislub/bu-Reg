import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester") || "fall2023"
    const academicYear = searchParams.get("academicYear") || "2023-2024"

    // Get enrollment counts by department
    const courses = await prisma.course.findMany({
      where: {
        semester,
        academicYear,
      },
      select: {
        department: true,
        currentEnrolled: true,
      },
    })

    // Group enrollments by department
    const departmentCounts = {}
    courses.forEach((course) => {
      const dept = course.department
      departmentCounts[dept] = (departmentCounts[dept] || 0) + course.currentEnrolled
    })

    // Convert to array format for chart
    const departmentData = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count,
    }))

    // Sort by count in descending order
    departmentData.sort((a, b) => b.count - a.count)

    return NextResponse.json(departmentData)
  } catch (error) {
    console.error("Error fetching department enrollment:", error)
    return NextResponse.json({ error: "Failed to fetch department enrollment" }, { status: 500 })
  }
}

