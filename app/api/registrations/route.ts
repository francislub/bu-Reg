import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const semesterId = url.searchParams.get("semesterId")
    const userId = url.searchParams.get("userId") || session.user.id
    const status = url.searchParams.get("status")

    // Build where clause based on parameters
    const whereClause: any = {}

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    if (userId) {
      whereClause.userId = userId
    }

    if (status) {
      whereClause.status = status
    }

    // Check if user has permission to view registrations
    if (session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const registrations = await db.registration.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
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

    return NextResponse.json({ success: true, registrations })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching registrations" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, semesterId } = body

    // Validate required fields
    if (!userId || !semesterId) {
      return NextResponse.json({ success: false, message: "User ID and semester ID are required" }, { status: 400 })
    }

    // Check if registration already exists
    const existingRegistration = await db.registration.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ success: false, message: "Registration already exists" }, { status: 400 })
    }

    // Create registration
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error("Registration creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during registration creation" },
      { status: 500 },
    )
  }
}
