import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get total students count
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT",
      },
    })

    // Get active courses count
    const activeCourses = await prisma.course.count()

    // Get faculty members count
    const facultyMembers = await prisma.faculty.count()

    // Get pending registrations count
    const pendingRegistrations = await prisma.registration.count({
      where: {
        status: "PENDING",
      },
    })

    return NextResponse.json({
      totalStudents,
      activeCourses,
      facultyMembers,
      pendingRegistrations,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}

