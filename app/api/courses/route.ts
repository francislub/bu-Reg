import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/courses - Get all courses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")
    const facultyId = searchParams.get("facultyId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build where clause based on query params
    const where: any = {}
    if (department) where.department = department
    if (semester) where.semester = semester
    if (academicYear) where.academicYear = academicYear
    if (facultyId) where.facultyId = facultyId

    const courses = await prisma.course.findMany({
      where,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    const total = await prisma.course.count({ where })

    return NextResponse.json({
      courses,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST /api/courses - Create a new course
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      code,
      title,
      credits,
      description,
      department,
      semester,
      academicYear,
      maxCapacity,
      prerequisites,
      facultyId,
    } = body

    // Check if course with same code already exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        code,
      },
    })

    if (existingCourse) {
      return NextResponse.json({ error: "Course with this code already exists" }, { status: 400 })
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        code,
        title,
        credits,
        description,
        department,
        semester,
        academicYear,
        maxCapacity,
        prerequisites: prerequisites || [],
        facultyId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

