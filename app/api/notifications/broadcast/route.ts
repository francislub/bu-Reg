import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendAnnouncementNotificationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authorized (admin or registrar)
    if (!session || !["ADMIN", "REGISTRAR", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    const { title, message } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ success: false, message: "Title and message are required" }, { status: 400 })
    }

    // Get all users
    const users = await db.user.findMany({
      include: {
        profile: true,
      },
    })

    // Create notifications for all users
    const notifications = await Promise.all(
      users.map(async (user) => {
        // Create in-app notification
        const notification = await db.notification.create({
          data: {
            userId: user.id,
            title,
            message,
            type: "SYSTEM",
            isRead: false,
          },
        })

        // Send email notification
        if (user.email) {
          try {
            await sendAnnouncementNotificationEmail(
              user.email,
              user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.name,
              { title, content: message },
            )
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error)
          }
        }

        return notification
      }),
    )

    return NextResponse.json({
      success: true,
      message: `Sent notifications to ${notifications.length} users`,
      count: notifications.length,
    })
  } catch (error) {
    console.error("Error broadcasting notifications:", error)
    return NextResponse.json({ success: false, message: "Failed to send notifications" }, { status: 500 })
  }
}
