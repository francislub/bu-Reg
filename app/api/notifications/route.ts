import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

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

    if (notification.user?.email) {
      try {
        await sendEmail({
          to: notification.user.email,
          subject: `Notification: ${notification.title}`,
          text: notification.message,
          html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bugema University</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications" 
                 style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                View Notification
              </a>
            </div>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
          </div>
        </div>
      `,
        })
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError)
        // Continue even if email fails
      }
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating notification" },
      { status: 500 },
    )
  }
}
