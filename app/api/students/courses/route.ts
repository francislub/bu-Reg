import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")
    const status = searchParams.get("status")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Build where clause for registrations
    const where: any = {
      studentId,
    }

    if (semester) where.semester = semester
    if (academicYear) where.academicYear = academicYear
    if (status) where.status = status

    // Get registrations for this student
    const registrations = await prisma.registration.findMany({
      where,
      include: {
        course: {
          include: {
            faculty: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          semester: "desc",
        },
        {
          academicYear: "desc",
        },
      ],
    })

    // Transform the data to make it more course-centric
    const courses = registrations.map((reg) => ({
      ...reg.course,
      registration: {
        id: reg.id,
        status: reg.status,
        registeredAt: reg.registeredAt,
        semester: reg.semester,
        academicYear: reg.academicYear,
      },
    }))

    return NextResponse.json({
      courses,
    })
  } catch (error) {
    console.error("Error fetching student courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

