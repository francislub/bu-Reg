import nodemailer from "nodemailer"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@bugemauniversity.ac.ug",
    to: email,
    subject: "Reset Your Bugema University Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bugema University</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Bugema University account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
          <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

export async function sendNotificationEmail(email: string, subject: string, message: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@bugemauniversity.ac.ug",
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bugema University</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>${subject}</h2>
          <div style="margin: 20px 0;">
            ${message}
          </div>
          <p>Thank you for using the Bugema University Registration System.</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error("Error sending notification email:", error)
    return { success: false, error }
  }
}
