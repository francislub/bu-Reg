import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get student counts by department
    const profiles = await prisma.profile.findMany({
      where: {
        department: {
          not: null,
        },
        user: {
          role: "STUDENT",
        },
      },
      select: {
        department: true,
      },
    })

    // Group students by department
    const departmentCounts = {}
    profiles.forEach((profile) => {
      const dept = profile.department || "Undeclared"
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1
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
    console.error("Error fetching department distribution:", error)
    return NextResponse.json({ error: "Failed to fetch department distribution" }, { status: 500 })
  }
}

