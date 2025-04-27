import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const notificationId = params.id
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 })
    }

    // Check if the notification belongs to the user
    if (notification.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { isRead } = body

    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead },
    })

    return NextResponse.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating notification" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const notificationId = params.id
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json({ success: false, message: "Notification not found" }, { status: 404 })
    }

    // Check if the notification belongs to the user
    if (notification.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    await db.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json({ success: true, message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting notification" },
      { status: 500 },
    )
  }
}
