import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Only students can register for courses" },
        { status: 403 }
      )
    }

    const { semesterId, courses, registrationDate, studentId } = await req.json()

    if (!semesterId || !courses || courses.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if student already has a registration for this semester
    const existingRegistration = await db.semesterRegistration.findFirst({
      where: {
        studentId: session.user.id,
        semesterId,
      },
    })

    let registration

    if (existingRegistration) {
      // Update existing registration
      registration = await db.semesterRegistration.update({
        where: {
          id: existingRegistration.id,
        },
        data: {
          registrationDate: new Date(registrationDate),
          status: "PENDING", // Reset to pending if courses are changed
          updatedAt: new Date(),
          // Delete existing course registrations and create new ones
          courseRegistrations: {
            deleteMany: {},
            create: courses.map(courseId => ({
              courseId,
              status: "PENDING",
            })),
          },
        },
        include: {
          courseRegistrations: true,
        },
      })
    } else {
      // Create new registration
      registration = await db.semesterRegistration.create({
        data: {
          semesterId,
          studentId: session.user.id,
          registrationDate: new Date(registrationDate),
          status: "PENDING",
          courseRegistrations: {
            create: courses.map(courseId => ({
              courseId,
              status: "PENDING",
            })),
          },
        },
        include: {
          courseRegistrations: true,
        },
      })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error in semester registration:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const semesterId = searchParams.get("semesterId")
    
    // If semesterId is provided, get registrations for that semester
    const where = semesterId 
      ? { semesterId, studentId: session.user.id }
      : { studentId: session.user.id }

    const registrations = await db.semesterRegistration.findMany({
      where,
      include: {
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseRegistrations: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Error fetching semester registrations:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
