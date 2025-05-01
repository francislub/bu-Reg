"use server"

import nodemailer from "nodemailer"

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Function to send notification emails
export async function sendNotificationEmail({ to, subject, text, html }) {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_FROM) {
      console.warn("Email configuration not available. Email not sent.")
      return { success: false, message: "Email configuration not available" }
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Failed to send email" }
  }
}

type EmailOptions = {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    // Create a test account if no email configuration is provided
    // In production, you would use your actual SMTP credentials
    const testAccount = await nodemailer.createTestAccount()

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.ethereal.email",
      port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER || testAccount.user,
        pass: process.env.EMAIL_SERVER_PASSWORD || testAccount.pass,
      },
    })

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Bugema University" <no-reply@bugema.ac.ug>',
      to,
      subject,
      text,
      html,
    })

    console.log("Email sent:", info.messageId)

    // If using Ethereal, log the preview URL
    if (!process.env.EMAIL_SERVER_HOST) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

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
    const result = await sendEmail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

// Add these new email notification functions after the existing functions

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    to: email,
    subject: "Welcome to Bugema University Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bugema University</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Welcome to Bugema University!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for creating an account on the Bugema University portal. We're excited to have you join our community!</p>
          <p>With your new account, you can:</p>
          <ul>
            <li>Register for courses</li>
            <li>View your academic records</li>
            <li>Access university announcements</li>
            <li>Manage your student profile</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to Your Account</a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    const result = await sendEmail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error }
  }
}

export async function sendLoginNotificationEmail(
  email: string,
  name: string,
  loginTime: Date,
  ipAddress: string,
  deviceInfo: string,
) {
  const mailOptions = {
    to: email,
    subject: "New Login to Your Bugema University Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bugema University</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>New Account Login</h2>
          <p>Dear ${name},</p>
          <p>We detected a new login to your Bugema University account.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Login Details:</strong></p>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Time:</strong> ${loginTime.toLocaleString()}</li>
              <li><strong>IP Address:</strong> ${ipAddress}</li>
              <li><strong>Device:</strong> ${deviceInfo}</li>
            </ul>
          </div>
          <p>If this was you, no action is needed. If you did not log in at this time, please contact our IT support immediately to secure your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Your Password</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    const result = await sendEmail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending login notification email:", error)
    return { success: false, error }
  }
}

export async function sendAnnouncementNotificationEmail(
  email: string,
  name: string,
  announcement: { title: string; content: string },
) {
  const mailOptions = {
    to: email,
    subject: `New Announcement: ${announcement.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bugema University</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>New Announcement</h2>
          <p>Dear ${name},</p>
          <p>A new announcement has been posted on the Bugema University portal:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${announcement.title}</h3>
            <div>${announcement.content}</div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/announcements" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View All Announcements</a>
          </div>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    const result = await sendEmail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending announcement notification email:", error)
    return { success: false, error }
  }
}

export async function sendRegistrationDeadlineEmail(email: string, name: string, semester: string, deadline: Date) {
  const mailOptions = {
    to: email,
    subject: `Registration Deadline Reminder: ${semester}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bugema University</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <h2>Registration Deadline Reminder</h2>
          <p>Dear ${name},</p>
          <p>This is a friendly reminder that the registration deadline for <strong>${semester}</strong> is approaching.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; margin: 0;"><strong>Deadline:</strong> ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}</p>
          </div>
          <p>Please ensure you complete your course registration before the deadline to avoid late registration fees or other penalties.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/registration" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Registration</a>
          </div>
          <p>If you have already completed your registration, please disregard this message.</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    const result = await sendEmail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending registration deadline email:", error)
    return { success: false, error }
  }
}
