import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, semesterId } = body

    // Validate required fields
    if (!userId || !semesterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user is authorized to create registrations for this user
    if (session.user.id !== userId && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ error: "Unauthorized to create registrations for this user" }, { status: 403 })
    }

    // Check if registration already exists
    const existingRegistration = await db.registration.findFirst({
      where: {
        userId,
        semesterId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json({
        registration: existingRegistration,
        message: "Registration already exists",
      })
    }

    // Create registration
    const registration = await db.registration.create({
      data: {
        userId,
        semesterId,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      registration,
      message: "Registration created successfully",
    })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const semesterId = url.searchParams.get("semesterId")
    const status = url.searchParams.get("status")

    // Build where clause
    const where: any = {}
    if (userId) where.userId = userId
    if (semesterId) where.semesterId = semesterId
    if (status) where.status = status

    // If not admin or registrar, only allow viewing own registrations
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized to view these registrations" }, { status: 403 })
    }

    const registrations = await db.registration.findMany({
      where,
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
            course: true,
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
