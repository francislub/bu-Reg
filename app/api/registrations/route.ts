import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import type { User } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as User & { id: string; role: string }
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") || user.id
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")

    if (studentId !== user.id && user.role !== "ADMIN" && user.role !== "FACULTY") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const whereClause: any = {
      studentId,
    }

    if (semester) {
      whereClause.semester = semester
    }

    if (academicYear) {
      whereClause.academicYear = academicYear
    }

    const registrations = await prisma.registration.findMany({
      where: whereClause,
      include: {
        course: true,
      },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as User & { id: string }
    const { courseId, semester, academicYear } = await req.json()

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if the course has available seats
    if (course.currentEnrolled >= course.maxCapacity) {
      return NextResponse.json({ message: "Course is full" }, { status: 400 })
    }

    // Check if the student is already registered for this course
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        studentId: user.id,
        courseId,
        semester,
        academicYear,
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ message: "You are already registered for this course" }, { status: 400 })
    }

    // Create the registration
    const registration = await prisma.registration.create({
      data: {
        studentId: user.id,
        courseId,
        semester,
        academicYear,
        status: "PENDING",
      },
    })

    // Update the course enrollment count
    await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        currentEnrolled: {
          increment: 1,
        },
      },
    })

    // Create a notification for the student
    await prisma.notification.create({
      data: {
        title: "Course Registration",
        message: `You have successfully registered for ${course.code}: ${course.title}. Your registration is pending approval.`,
        type: "REGISTRATION",
        userId: user.id,
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

