import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const status = url.searchParams.get("status")

    const registrations = await db.registration.findMany({
      where: status ? { status: status.toUpperCase() } : undefined,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: true,
        courseUploads: {
          include: {
            course: true,
          },
        },
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
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, semesterId } = body

    // Check if user is already registered for this semester
    const existingRegistration = await db.registration.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, message: "User is already registered for this semester" },
        { status: 400 },
      )
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
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during registration" }, { status: 500 })
  }
}
