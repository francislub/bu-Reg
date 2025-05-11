import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Check if user has permission to view this profile
    if (session.user.role !== "REGISTRAR" && session.user.id !== userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Only allow admins and registrars to delete users
    if (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const userId = params.id

    // First, find the user to get their profileId
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { profileId: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Delete the user first (this will cascade delete related records)
    await db.user.delete({
      where: { id: userId },
    })

    // If there's a profile, delete it too
    if (user.profileId) {
      await db.profile.delete({
        where: { id: user.profileId },
      })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 })
  }
}
