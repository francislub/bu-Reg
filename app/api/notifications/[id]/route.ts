import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/notifications/[id] - Get a notification by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error fetching notification:", error)
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 })
  }
}

// PUT /api/notifications/[id] - Update a notification
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { isRead } = body

    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Update notification
    const notification = await prisma.notification.update({
      where: {
        id: params.id,
      },
      data: {
        isRead,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Delete notification
    await prisma.notification.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}

