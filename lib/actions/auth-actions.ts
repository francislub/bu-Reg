"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { sendPasswordResetEmail } from "@/lib/email"

export async function requestPasswordReset(email: string) {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return { success: true, message: "If your email is registered, you will receive a password reset link." }
    }

    // Generate a unique token and set expiry (24 hours from now)
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Send email with reset link
    await sendPasswordResetEmail(user.email, resetToken)

    return { success: true, message: "If your email is registered, you will receive a password reset link." }
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return { success: false, message: "An error occurred. Please try again later." }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Find user with this token and check if token is still valid
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return { success: false, message: "Invalid or expired reset token. Please request a new password reset." }
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update user password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return {
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, message: "An error occurred. Please try again later." }
  }
}
