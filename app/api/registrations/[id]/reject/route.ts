import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const registrationId = params.id
    const body = await req.json()
    const { reason } = body

    // Check if registration exists
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
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
        status: "REJECTED",
        rejectionReason: reason,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: true,
      },
    })

    return NextResponse.json({ success: true, registration: updatedRegistration })
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while rejecting registration" },
      { status: 500 },
    )
  }
}
