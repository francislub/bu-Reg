import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const semesterId = url.searchParams.get("semesterId")

    const where: any = {}
    if (userId) where.userId = userId
    if (semesterId) where.semesterId = semesterId

    const registrationCards = await db.registrationCard.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: true,
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

    // Check if user already has a registration card for this semester
    const existingCard = await db.registrationCard.findFirst({
      where: {
        userId,
        semesterId,
      },
    })

    if (existingCard) {
      return NextResponse.json(
        { success: false, message: "User already has a registration card for this semester" },
        { status: 400 },
      )
    }

    // Generate card number
    const latestCard = await db.registrationCard.findFirst({
      orderBy: { cardNumber: "desc" },
    })

    let cardNumber = "BU" + new Date().getFullYear() + "-0001"
    if (latestCard) {
      const currentNumber = Number.parseInt(latestCard.cardNumber.split("-")[1])
      cardNumber = `BU${new Date().getFullYear()}-${(currentNumber + 1).toString().padStart(4, "0")}`
    }

    // Create registration card
    const registrationCard = await db.registrationCard.create({
      data: {
        userId,
        semesterId,
        cardNumber,
      },
    })

    return NextResponse.json({ success: true, registrationCard })
  } catch (error) {
    console.error("Registration card creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during registration card creation" },
      { status: 500 },
    )
  }
}
