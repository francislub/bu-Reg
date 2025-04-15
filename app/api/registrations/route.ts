import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const registrationSchema = z.object({
  userId: z.string(),
  semesterId: z.string(),
  courseIds: z.array(z.string()).min(1),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = registrationSchema.parse(body)

    // Check if user is registering for themselves or if they have permission
    if (session.user.id !== validatedData.userId && session.user.role === userRoles.STUDENT) {
      return NextResponse.json({ message: "You can only register courses for yourself" }, { status: 403 })
    }

    // Check if semester exists and is active
    const semester = await prisma.semester.findUnique({
      where: {
        id: validatedData.semesterId,
        isActive: true,
      },
    })

    if (!semester) {
      return NextResponse.json({ message: "Semester not found or not active" }, { status: 404 })
    }

    // Check if registration deadline has passed
    if (semester.registrationDeadline && new Date(semester.registrationDeadline) < new Date()) {
      return NextResponse.json({ message: "Registration deadline has passed" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: validatedData.userId,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create or update registration
    let registration = await prisma.registration.findUnique({
      where: {
        userId_semesterId: {
          userId: validatedData.userId,
          semesterId: validatedData.semesterId,
        },
      },
    })

    if (!registration) {
      registration = await prisma.registration.create({
        data: {
          userId: validatedData.userId,
          semesterId: validatedData.semesterId,
          status: "PENDING",
        },
      })
    }

    // Delete existing course uploads for this registration
    await prisma.courseUpload.deleteMany({
      where: {
        registrationId: registration.id,
      },
    })

    // Create course uploads
    const courseUploads = await Promise.all(
      validatedData.courseIds.map((courseId) =>
        prisma.courseUpload.create({
          data: {
            registrationId: registration!.id,
            courseId,
            userId: validatedData.userId,
            semesterId: validatedData.semesterId,
            status: "PENDING",
          },
        }),
      ),
    )

    return NextResponse.json(
      {
        message: "Courses registered successfully",
        registration,
        courseUploads,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error registering courses:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const semesterId = searchParams.get("semesterId")
    const status = searchParams.get("status")

    const whereClause: any = {}

    // Students can only view their own registrations
    if (session.user.role === userRoles.STUDENT) {
      whereClause.userId = session.user.id
    } else if (userId) {
      whereClause.userId = userId
    }

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    if (status) {
      whereClause.status = status
    }

    const registrations = await prisma.registration.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        semester: true,
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

    return NextResponse.json(registrations)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
