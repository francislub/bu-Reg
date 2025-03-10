"use server"

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

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`

  try {
    // In development, just log the email
    if (process.env.NODE_ENV === "development") {
      console.log(`Verification Email to: ${email}, URL: ${verificationUrl}`)
      return { success: true }
    }

    // In production, send actual email
    await transporter.sendMail({
      from: "noreply@bugema.edu",
      to: email,
      subject: "Verify Your Email - Bugema University",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering with Bugema University. Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>If you did not create an account, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { error: "Failed to send verification email" }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

  try {
    // In development, just log the email
    if (process.env.NODE_ENV === "development") {
      console.log(`Password Reset Email to: ${email}, URL: ${resetUrl}`)
      return { success: true }
    }

    // In production, send actual email
    await transporter.sendMail({
      from: "noreply@bugema.edu",
      to: email,
      subject: "Reset Your Password - Bugema University",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Bugema University account. Please click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { error: "Failed to send password reset email" }
  }
}

export async function sendRegistrationConfirmationEmail(email: string, courseDetails: any) {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === "development") {
      console.log(`Registration Confirmation Email to: ${email}, Course: ${courseDetails.title}`)
      return { success: true }
    }

    // In production, send actual email
    await transporter.sendMail({
      from: "noreply@bugema.edu",
      to: email,
      subject: "Course Registration Confirmation - Bugema University",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Course Registration Confirmation</h2>
          <p>Your registration for the following course has been confirmed:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Course Code:</strong> ${courseDetails.courseCode}</p>
            <p><strong>Course Title:</strong> ${courseDetails.title}</p>
            <p><strong>Semester:</strong> ${courseDetails.semester}</p>
            <p><strong>Academic Year:</strong> ${courseDetails.academicYear}</p>
            <p><strong>Credits:</strong> ${courseDetails.credits}</p>
          </div>
          <p>You can view your course schedule in your student portal.</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { error: "Failed to send registration confirmation email" }
  }
}

