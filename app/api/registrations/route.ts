import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/registrations - Get all registrations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const courseId = searchParams.get("courseId")
    const status = searchParams.get("status")
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build where clause based on query params
    const where: any = {}
    if (studentId) where.studentId = studentId
    if (courseId) where.courseId = courseId
    if (status) where.status = status
    if (semester) where.semester = semester
    if (academicYear) where.academicYear = academicYear

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
        course: true,
      },
      skip,
      take: limit,
      orderBy: {
        registeredAt: "desc",
      },
    })

    const total = await prisma.registration.count({ where })

    return NextResponse.json({
      registrations,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

// POST /api/registrations - Create a new registration
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, courseId, semester, academicYear } = body

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: "STUDENT",
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if registration already exists
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        studentId,
        courseId,
        semester,
        academicYear,
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Registration already exists" }, { status: 400 })
    }

    // Check if course is full
    if (course.currentEnrolled >= course.maxCapacity) {
      return NextResponse.json({ error: "Course is at maximum capacity" }, { status: 400 })
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        studentId,
        courseId,
        semester,
        academicYear,
        status: "PENDING",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNo: true,
          },
        },
        course: true,
      },
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        title: "Registration Submitted",
        message: `Your registration for ${course.code}: ${course.title} has been submitted and is pending approval.`,
        type: "REGISTRATION",
        userId: studentId,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}

