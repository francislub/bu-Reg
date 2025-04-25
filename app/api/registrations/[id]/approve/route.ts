import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { generateRegistrationCardNumber } from "@/lib/utils"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const registrationId = params.id

    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: true,
        semester: true,
      },
    })

    if (!registration) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 })
    }

    // Update registration status
    const updatedRegistration = await db.registration.update({
      where: {
        id: registrationId,
      },
      data: {
        status: "APPROVED",
      },
      include: {
        user: true,
        semester: true,
      },
    })

    // Generate registration card if it doesn't exist
    let registrationCard = await db.registrationCard.findFirst({
      where: {
        userId: registration.userId,
        semesterId: registration.semesterId,
      },
    })

    if (!registrationCard) {
      const cardNumber = await generateRegistrationCardNumber(registration.user.id, registration.semester.id)

      registrationCard = await db.registrationCard.create({
        data: {
          userId: registration.userId,
          semesterId: registration.semesterId,
          cardNumber,
          issuedDate: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      registrationCard,
    })
  } catch (error) {
    console.error("Error approving registration:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while approving registration" },
      { status: 500 },
    )
  }
}
