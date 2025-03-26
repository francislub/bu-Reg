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

    if (session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get("facultyId")
    const status = searchParams.get("status")
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")

    if (!facultyId) {
      return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 })
    }

    // Get courses taught by this faculty
    const courses = await prisma.course.findMany({
      where: {
        facultyId,
      },
      select: {
        id: true,
      },
    })

    const courseIds = courses.map((course) => course.id)

    if (courseIds.length === 0) {
      return NextResponse.json({
        registrations: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        },
      })
    }

    // Build where clause based on query params
    const where: any = {
      courseId: {
        in: courseIds,
      },
    }

    if (status) where.status = status
    if (semester) where.semester = semester
    if (academicYear) where.academicYear = academicYear

    // Get registrations for these courses
    const registrations = await prisma.registration.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNo: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            credits: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
      },
    })

    const total = await prisma.registration.count({ where })

    return NextResponse.json({
      registrations,
      meta: {
        total,
        page: 1,
        limit: registrations.length,
        pages: 1,
      },
    })
  } catch (error) {
    console.error("Error fetching faculty registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

