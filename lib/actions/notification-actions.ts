"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendNotificationEmail } from "@/lib/email"

export async function createNotification(data: {
  userId: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  sendEmail?: boolean
}) {
  try {
    // Create notification in database
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        isRead: false,
      },
    })

    // Send email notification if requested
    if (data.sendEmail) {
      const user = await db.user.findUnique({
        where: { id: data.userId },
      })

      if (user?.email) {
        await sendNotificationEmail(user.email, data.title, data.message)
      }
    }

    revalidatePath("/dashboard/notifications")
    return { success: true, notification }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, message: "Failed to create notification" }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    revalidatePath("/dashboard/notifications")
    return { success: true, notification }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, message: "Failed to mark notification as read" }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    revalidatePath("/dashboard/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, message: "Failed to mark all notifications as read" }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await db.notification.delete({
      where: { id: notificationId },
    })

    revalidatePath("/dashboard/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, message: "Failed to delete notification" }
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, notifications }
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    return { success: false, message: "Failed to fetch notifications" }
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const count = await db.notification.count({
      where: { userId, isRead: false },
    })

    return { success: true, count }
  } catch (error) {
    console.error("Error counting unread notifications:", error)
    return { success: false, message: "Failed to count unread notifications" }
  }
}

export async function sendBulkNotification(data: {
  userIds: string[]
  title: string
  message: string
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR"
  sendEmail?: boolean
}) {
  try {
    const notifications = []

    // Create notifications for each user
    for (const userId of data.userIds) {
      const notification = await db.notification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
        },
      })

      notifications.push(notification)

      // Send email notification if requested
      if (data.sendEmail) {
        const user = await db.user.findUnique({
          where: { id: userId },
        })

        if (user?.email) {
          await sendNotificationEmail(user.email, data.title, data.message)
        }
      }
    }

    revalidatePath("/dashboard/notifications")
    return { success: true, notifications }
  } catch (error) {
    console.error("Error sending bulk notification:", error)
    return { success: false, message: "Failed to send bulk notification" }
  }
}
