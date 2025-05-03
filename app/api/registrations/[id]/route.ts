import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const registrationId = params.id

    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: true,
          },
        },
      },
    })

    if (!registration) {
      return new NextResponse("Registration not found", { status: 404 })
    }

    // Check if user has permission to view this registration
    if (registration.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("[REGISTRATION_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const registrationId = params.id
    const body = await req.json()
    const { courseIds } = body

    // Get the existing registration
    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
      include: {
        courseUploads: true,
      },
    })

    if (!registration) {
      return new NextResponse("Registration not found", { status: 404 })
    }

    // Check if user has permission to update this registration
    if (registration.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if registration can be updated (not already approved or rejected)
    if (registration.status === "APPROVED" || registration.status === "REJECTED") {
      return new NextResponse(`Cannot update registration with status: ${registration.status}`, { status: 400 })
    }

    // Delete existing course uploads
    await db.courseUpload.deleteMany({
      where: {
        registrationId,
      },
    })

    // Create new course uploads
    const courseUploads = await Promise.all(
      courseIds.map(async (courseId: string) => {
        return db.courseUpload.create({
          data: {
            registrationId,
            courseId,
            userId: registration.userId,
            semesterId: registration.semesterId,
            status: "PENDING",
          },
        })
      }),
    )

    // Update registration status to PENDING if it was DRAFT
    if (registration.status === "DRAFT") {
      await db.registration.update({
        where: {
          id: registrationId,
        },
        data: {
          status: "PENDING",
        },
      })
    }

    // Create a notification for the student
    await db.notification.create({
      data: {
        userId: registration.userId,
        title: "Registration Updated",
        message: "Your course registration has been updated and is pending approval.",
        type: "INFO",
      },
    })

    return NextResponse.json({
      success: true,
      courseUploads,
    })
  } catch (error) {
    console.error("[REGISTRATION_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const registrationId = params.id

    // Get the existing registration
    const registration = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
    })

    if (!registration) {
      return new NextResponse("Registration not found", { status: 404 })
    }

    // Check if user has permission to delete this registration
    if (registration.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if registration can be deleted (not already approved)
    if (registration.status === "APPROVED") {
      return new NextResponse("Cannot delete an approved registration", { status: 400 })
    }

    // Delete course uploads first
    await db.courseUpload.deleteMany({
      where: {
        registrationId,
      },
    })

    // Delete the registration
    await db.registration.delete({
      where: {
        id: registrationId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    })
  } catch (error) {
    console.error("[REGISTRATION_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
