import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester") || "fall2023"
    const academicYear = searchParams.get("academicYear") || "2023-2024"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get courses with enrollment counts
    const courses = await prisma.course.findMany({
      where: {
        semester,
        academicYear,
      },
      select: {
        id: true,
        code: true,
        title: true,
        department: true,
        currentEnrolled: true,
        maxCapacity: true,
      },
      orderBy: {
        currentEnrolled: "desc",
      },
      take: limit,
    })

    // Format data for chart
    const courseData = courses.map((course) => ({
      course: `${course.code}: ${course.title.length > 20 ? course.title.substring(0, 20) + "..." : course.title}`,
      department: course.department,
      enrolled: course.currentEnrolled,
      capacity: course.maxCapacity,
      fillRate: Math.round((course.currentEnrolled / course.maxCapacity) * 100),
    }))

    return NextResponse.json(courseData)
  } catch (error) {
    console.error("Error fetching course popularity:", error)
    return NextResponse.json({ error: "Failed to fetch course popularity" }, { status: 500 })
  }
}

