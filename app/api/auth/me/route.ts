import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      registrationNo: session.user.registrationNo,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

