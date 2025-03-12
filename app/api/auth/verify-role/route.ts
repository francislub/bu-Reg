import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { expectedRole } = await req.json()

    if (!expectedRole) {
      return NextResponse.json({ success: false, message: "Expected role is required" }, { status: 400 })
    }

    const hasRole = session.user.role === expectedRole

    if (!hasRole) {
      return NextResponse.json({
        success: false,
        message: `Access denied. This area is restricted to ${expectedRole.toLowerCase()} users.`,
        redirectUrl: getRoleBasedRedirectUrl(session.user.role),
      })
    }

    return NextResponse.json({
      success: true,
      message: `Welcome, ${session.user.name || "User"}`,
      role: session.user.role,
    })
  } catch (error) {
    console.error("Error verifying role:", error)
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 })
  }
}

function getRoleBasedRedirectUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "FACULTY":
      return "/faculty/dashboard"
    case "STUDENT":
    default:
      return "/dashboard/student"
  }
}

