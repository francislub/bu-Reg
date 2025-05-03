import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const registration = await db.semesterRegistration.findUnique({
      where: {
        id: params.id,
      },
      include: {
        semester: {
          include: {
            academicYear: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: true,
          },
        },
        courseRegistrations: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      )
    }

    // Check if user is authorized to view this registration
    if (
      session.user.id !== registration.studentId &&
      session.user.role !== "REGISTRAR" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching semester registration:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only registrars and admins can update registration status
    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    const { status, comment } = await req.json()

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      )
    }

    const registration = await db.semesterRegistration.update({
      where: {
        id: params.id,
      },
      data: {
        status,
        comment,
        approvedById: status === "APPROVED" ? session.user.id : null,
        approvedAt: status === "APPROVED" ? new Date() : null,
        // Update all course registrations with the same status
        courseRegistrations: {
          updateMany: {
            where: {},
            data: {
              status,
            },
          },
        },
      },
      include: {
        courseRegistrations: true,
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error updating semester registration:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const registration = await db.semesterRegistration.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      )
    }

    // Only the student who created the registration or admin/registrar can delete it
    if (
      session.user.id !== registration.studentId &&
      session.user.role !== "REGISTRAR" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      )
    }

    // Only allow deletion if status is PENDING
    if (registration.status !== "PENDING") {
      return NextResponse.json(
        { message: "Cannot delete approved or rejected registrations" },
        { status: 400 }
      )
    }

    // Delete course registrations first
    await db.courseRegistration.deleteMany({
      where: {
        semesterRegistrationId: params.id,
      },
    })

    // Then delete the semester registration
    await db.semesterRegistration.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting semester registration:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
