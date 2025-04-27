import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    })

    const totalCount = await db.notification.count({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching notifications" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userId, title, message, type } = body

    if (!userId || !title || !message || !type) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating notification" },
      { status: 500 },
    )
  }
}
