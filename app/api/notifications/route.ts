import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/notifications - Get all notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type")
    const isRead = searchParams.get("isRead") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build where clause based on query params
    const where: any = {}
    if (userId) where.userId = userId
    if (type) where.type = type
    if (searchParams.has("isRead")) where.isRead = isRead

    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
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

    const total = await prisma.notification.count({ where })

    return NextResponse.json({
      notifications,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, type, userId, userIds } = body

    // If userIds is provided, create notifications for multiple users
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      const notifications = await Promise.all(
        userIds.map((id) =>
          prisma.notification.create({
            data: {
              title,
              message,
              type: type || "SYSTEM",
              userId: id,
            },
          }),
        ),
      )

      return NextResponse.json({ message: `${notifications.length} notifications created` }, { status: 201 })
    }

    // Create notification for a single user or system-wide
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || "SYSTEM",
        userId,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

