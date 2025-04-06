import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/registrations/[id] - Get a registration by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const registration = await prisma.registration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNo: true,
            profile: true,
          },
        },
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
    })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 })
  }
}

// PUT /api/registrations/[id] - Update a registration
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    // Check if registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        student: true,
        course: true,
      },
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Update registration
    const registration = await prisma.registration.update({
      where: {
        id: params.id,
      },
      data: {
        status,
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

    // If status is APPROVED, increment course enrollment
    if (status === "APPROVED" && existingRegistration.status !== "APPROVED") {
      await prisma.course.update({
        where: {
          id: existingRegistration.courseId,
        },
        data: {
          currentEnrolled: {
            increment: 1,
          },
        },
      })

      // Create notification for student
      await prisma.notification.create({
        data: {
          title: "Registration Approved",
          message: `Your registration for ${existingRegistration.course.code}: ${existingRegistration.course.title} has been approved.`,
          type: "REGISTRATION",
          userId: existingRegistration.studentId,
        },
      })
    }

    // If status is REJECTED, create notification for student
    if (status === "REJECTED" && existingRegistration.status !== "REJECTED") {
      await prisma.notification.create({
        data: {
          title: "Registration Rejected",
          message: `Your registration for ${existingRegistration.course.code}: ${existingRegistration.course.title} has been rejected.`,
          type: "REGISTRATION",
          userId: existingRegistration.studentId,
        },
      })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
  }
}

// DELETE /api/registrations/[id] - Delete a registration
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if registration exists
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: true,
      },
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // If registration was approved, decrement course enrollment
    if (existingRegistration.status === "APPROVED") {
      await prisma.course.update({
        where: {
          id: existingRegistration.courseId,
        },
        data: {
          currentEnrolled: {
            decrement: 1,
          },
        },
      })
    }

    // Delete registration
    await prisma.registration.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Registration deleted successfully" })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}

