import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester") || "fall2023"
    const academicYear = searchParams.get("academicYear") || "2023-2024"

    // Get total enrollments
    const totalEnrollments = await prisma.registration.count({
      where: {
        semester,
        academicYear,
        status: "APPROVED",
      },
    })

    // Get course count
    const courseCount = await prisma.course.count({
      where: {
        semester,
        academicYear,
      },
    })

    // Calculate average per course
    const averagePerCourse = courseCount > 0 ? Math.round(totalEnrollments / courseCount) : 0

    // Get full courses count
    const fullCourses = await prisma.course.count({
      where: {
        semester,
        academicYear,
        currentEnrolled: {
          gte: prisma.course.fields.maxCapacity,
        },
      },
    })

    // Get low enrollment courses count (less than 50% capacity)
    const lowEnrollment = await prisma.course.count({
      where: {
        semester,
        academicYear,
        currentEnrolled: {
          lt: prisma.course.fields.maxCapacity.divide(2),
        },
      },
    })

    return NextResponse.json({
      totalEnrollments,
      averagePerCourse,
      fullCourses,
      lowEnrollment,
    })
  } catch (error) {
    console.error("Error fetching enrollment stats:", error)
    return NextResponse.json({ error: "Failed to fetch enrollment stats" }, { status: 500 })
  }
}

