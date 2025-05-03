import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { userId, semesterId, courseIds } = body

    // Verify the user is registering themselves or has admin/registrar privileges
    if (userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Check if a registration already exists for this user and semester
    const existingRegistration = await db.registration.findFirst({
      where: {
        userId,
        semesterId,
      },
    })

    if (existingRegistration) {
      return new NextResponse("Registration already exists for this semester", { status: 400 })
    }

    // Create a new registration
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "PENDING",
      },
    })

    // Create course uploads for each selected course
    const courseUploads = await Promise.all(
      courseIds.map(async (courseId: string) => {
        return db.courseUpload.create({
          data: {
            registrationId: registration.id,
            courseId,
            userId,
            semesterId,
            status: "PENDING",
          },
        })
      }),
    )

    // Create a notification for the student
    await db.notification.create({
      data: {
        userId,
        title: "Registration Submitted",
        message: "Your course registration has been submitted and is pending approval.",
        type: "INFO",
      },
    })

    // Create notifications for registrars
    const registrars = await db.user.findMany({
      where: {
        role: "REGISTRAR",
      },
    })

    await Promise.all(
      registrars.map(async (registrar) => {
        return db.notification.create({
          data: {
            userId: registrar.id,
            title: "New Registration",
            message: `A new registration has been submitted by ${session.user.name || "a student"} and requires your approval.`,
            type: "INFO",
          },
        })
      }),
    )

    return NextResponse.json({
      registration,
      courseUploads,
    })
  } catch (error) {
    console.error("[REGISTRATIONS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const semesterId = searchParams.get("semesterId")
    const status = searchParams.get("status")

    // Build the query based on provided parameters
    const query: any = {}

    if (userId) {
      query.userId = userId
    }

    if (semesterId) {
      query.semesterId = semesterId
    }

    if (status) {
      query.status = status
    }

    // If not an admin or registrar, only show own registrations
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      query.userId = session.user.id
    }

    const registrations = await db.registration.findMany({
      where: query,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("[REGISTRATIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
