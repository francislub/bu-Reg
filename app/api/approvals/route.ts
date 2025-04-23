import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { approveRegistration, rejectRegistration } from "@/lib/actions/registration-actions"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to approve/reject registrations
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR" && session.user.role !== "STAFF") {
      return NextResponse.json(
        { success: false, message: "Unauthorized to approve/reject registrations" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { registrationId, action } = body

    if (!registrationId) {
      return NextResponse.json({ success: false, message: "Registration ID is required" }, { status: 400 })
    }

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { success: false, message: "Valid action (approve/reject) is required" },
        { status: 400 },
      )
    }

    let result
    if (action === "approve") {
      result = await approveRegistration(registrationId, session.user.id)
    } else {
      result = await rejectRegistration(registrationId, session.user.id)
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || `Failed to ${action} registration` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Registration ${action === "approve" ? "approved" : "rejected"} successfully`,
      registration: result.registration,
    })
  } catch (error) {
    console.error(`Error ${request.method} /api/approvals:`, error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
