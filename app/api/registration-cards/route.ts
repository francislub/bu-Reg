import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { generateRegistrationCardNumber } from "@/lib/utils"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") || session.user.id
    const semesterId = url.searchParams.get("semesterId")

    // Check if user has permission to view registration cards
    if (session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    // Build where clause based on parameters
    const whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }

    if (semesterId) {
      whereClause.semesterId = semesterId
    }

    const registrationCards = await db.registrationCard.findMany({
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
      },
      orderBy: {
        issuedDate: "desc",
      },
    })

    return NextResponse.json({ success: true, registrationCards })
  } catch (error) {
    console.error("Error fetching registration cards:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching registration cards" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, semesterId } = body

    // Validate required fields
    if (!userId || !semesterId) {
      return NextResponse.json({ success: false, message: "User ID and semester ID are required" }, { status: 400 })
    }

    // Check if registration card already exists
    const existingCard = await db.registrationCard.findFirst({
      where: {
        userId,
        semesterId,
      },
    })

    if (existingCard) {
      return NextResponse.json(
        { success: false, message: "Registration card already exists for this student and semester" },
        { status: 400 },
      )
    }

    // Check if registration exists and is approved
    const registration = await db.registration.findUnique({
      where: {
        userId_semesterId: {
          userId,
          semesterId,
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Student is not registered for this semester" },
        { status: 400 },
      )
    }

    if (registration.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Semester registration must be approved before issuing a registration card" },
        { status: 400 },
      )
    }

    // Generate registration card number
    const cardNumber = await generateRegistrationCardNumber(userId, semesterId)

    // Create registration card
    const registrationCard = await db.registrationCard.create({
      data: {
        userId,
        semesterId,
        cardNumber,
        issuedDate: new Date(),
      },
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
      },
    })

    return NextResponse.json({ success: true, registrationCard })
  } catch (error) {
    console.error("Error creating registration card:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating registration card" },
      { status: 500 },
    )
  }
}
