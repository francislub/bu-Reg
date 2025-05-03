import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get("semesterId")
    const userId = searchParams.get("userId") || session.user.id

    // Only admin and registrars can view other users' registrations
    if (userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Build query
    const where = semesterId ? { userId, semesterId } : { userId }

    const registrations = await db.registration.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { userId, semesterId, courseIds } = body

    // Validate required fields
    if (!semesterId || !courseIds || courseIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // For non-admin users, they can only create registrations for themselves
    if (userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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

    // Check if student already has a registration for this semester
    const existingRegistration = await db.registration.findFirst({
      where: {
        userId,
        semesterId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        {
          error: "Registration already exists for this semester",
          registrationId: existingRegistration.id,
        },
        { status: 409 },
      )
    }

    // Create new registration
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "DRAFT",
        courseUploads: {
          create: courseIds.map((courseId) => ({
            courseId,
            userId,
            semesterId,
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

    return NextResponse.json({ registration })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}
