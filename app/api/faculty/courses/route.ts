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
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")

    if (!facultyId) {
      return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 })
    }

    // Build where clause based on query params
    const where: any = {
      facultyId,
    }

    if (semester) where.semester = semester
    if (academicYear) where.academicYear = academicYear

    // Get courses taught by this faculty
    const courses = await prisma.course.findMany({
      where,
      include: {
        registrations: {
          select: {
            id: true,
            studentId: true,
            status: true,
          },
          where: {
            status: "APPROVED",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      courses,
    })
  } catch (error) {
    console.error("Error fetching faculty courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

