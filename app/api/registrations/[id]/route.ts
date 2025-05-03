import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registration = await db.registration.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Authorization check: only the user, admin or registrar can view
    if (registration.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get existing registration
    const existingRegistration = await db.registration.findUnique({
      where: { id: params.id },
      include: {
        courseUploads: true,
      },
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Authorization check: only the user, admin or registrar can update
    if (
      existingRegistration.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "REGISTRAR"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Status check: can't update approved/rejected registrations
    if (existingRegistration.status === "APPROVED" || existingRegistration.status === "REJECTED") {
      return NextResponse.json(
        {
          error: `Cannot update a registration with status ${existingRegistration.status}`,
        },
        { status: 400 },
      )
    }

    // Parse request body
    const body = await request.json()
    const { courseIds } = body

    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: "Invalid course IDs" }, { status: 400 })
    }

    // Check credit units total - maximum allowed is 24
    const courses = await db.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    })

    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)

    if (totalCredits > 24) {
      return NextResponse.json(
        {
          error: "Total credit units exceed the maximum of 24",
          totalCredits,
        },
        { status: 400 },
      )
    }

    // Transaction to update registration
    const registration = await db.$transaction(async (tx) => {
      // 1. Delete all existing course uploads
      await tx.courseUpload.deleteMany({
        where: {
          registrationId: params.id,
        },
      })

      // 2. Update the registration
      const updatedRegistration = await tx.registration.update({
        where: {
          id: params.id,
        },
        data: {
          status: "PENDING", // Reset to pending on update
          updatedAt: new Date(),
          courseUploads: {
            create: courseIds.map((courseId: string) => ({
              courseId,
              userId: existingRegistration.userId,
              semesterId: existingRegistration.semesterId,
              status: "PENDING",
            })),
          },
        },
        include: {
          user: true,
          semester: true,
          courseUploads: {
            include: {
              course: true,
            },
          },
        },
      })

      return updatedRegistration
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get existing registration
    const existingRegistration = await db.registration.findUnique({
      where: { id: params.id },
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Authorization check: only the user, admin or registrar can delete
    if (
      existingRegistration.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "REGISTRAR"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Status check: can't delete approved registrations
    if (existingRegistration.status === "APPROVED") {
      return NextResponse.json(
        {
          error: "Cannot delete an approved registration",
        },
        { status: 400 },
      )
    }

    // Transaction to delete registration
    await db.$transaction(async (tx) => {
      // 1. Delete all course uploads
      await tx.courseUpload.deleteMany({
        where: {
          registrationId: params.id,
        },
      })

      // 2. Delete the registration
      await tx.registration.delete({
        where: {
          id: params.id,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}
