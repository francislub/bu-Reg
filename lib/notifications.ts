"use server"

import { prisma } from "@/lib/db"
import nodemailer from "nodemailer"

// Configure email transporter (in production, use a real email service)
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "username",
    pass: "password",
  },
})

export async function sendNotification(userId: string, title: string, message: string, type = "INFO") {
  try {
    // Create notification in database
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    })

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user && user.email) {
      // Send email notification
      await sendEmail(user.email, title, message)
    }

    return { success: true }
  } catch (error) {
    console.error("Notification error:", error)
    return { error: "Failed to send notification" }
  }
}

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === "development") {
      console.log(`Email to: ${to}, Subject: ${subject}, Message: ${text}`)
      return { success: true }
    }

    // In production, send actual email
    await transporter.sendMail({
      from: "noreply@bugema.edu",
      to,
      subject,
      text,
    })

    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { error: "Failed to send email" }
  }
}

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    // In development, just log the SMS
    if (process.env.NODE_ENV === "development") {
      console.log(`SMS to: ${phoneNumber}, Message: ${message}`)
      return { success: true }
    }

    // In production, integrate with an SMS service
    // Example: Twilio, Nexmo, etc.

    return { success: true }
  } catch (error) {
    console.error("SMS error:", error)
    return { error: "Failed to send SMS" }
  }
}

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return notifications
  } catch (error) {
    console.error("Get notifications error:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return { success: true }
  } catch (error) {
    console.error("Mark notification error:", error)
    return { error: "Failed to mark notification as read" }
  }
}

