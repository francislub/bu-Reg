"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { generateToken } from "@/lib/utils"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const registrationNo = formData.get("registrationNo") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const role = formData.get("role") as string

  // Validation
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { registrationNo: registrationNo || undefined }],
    },
  })

  if (existingUser) {
    return { error: "User with this email or registration number already exists" }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Create user based on role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        registrationNo: registrationNo || undefined,
        role: role === "FACULTY" ? "FACULTY" : role === "ADMIN" ? "ADMIN" : "STUDENT",
        name: `${firstName} ${lastName}`,
      },
    })

    // Create profile based on role
    if (role === "STUDENT") {
      await prisma.student.create({
        data: {
          userId: user.id,
          name: `${firstName} ${lastName}`,
        },
      })
    } else if (role === "FACULTY") {
      await prisma.faculty.create({
        data: {
          user: {
            connect: {
              id: user.id
            }
          },
          name: `${firstName} ${lastName}`,
          department: (formData.get("department") as string) || "General",
          position: (formData.get("position") as string) || "Lecturer",
        },
      })
    } else if (role === "ADMIN") {
      await prisma.admin.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          department: (formData.get("department") as string) || "Administration",
        },
      })
    }

    // Send verification email
    const verificationToken = generateToken()
    // await sendVerificationEmail(email, verificationToken);

    return { success: "User registered successfully. Please verify your email." }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Failed to register user" }
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validation
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Invalid credentials" }
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { error: "Invalid credentials" }
    }

    // Check if user is verified
    if (!user.isVerified) {
      return { error: "Please verify your email before logging in" }
    }

    // Redirect based on role
    if (user.role === "STUDENT") {
      redirect("/dashboard/student")
    } else if (user.role === "FACULTY") {
      redirect("/dashboard/faculty")
    } else if (user.role === "ADMIN") {
      redirect("/dashboard/admin")
    }

    return { success: "Logged in successfully" }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Failed to log in" }
  }
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist
      return { success: "If your email is registered, you will receive a password reset link" }
    }

    const resetToken = generateToken()
    const resetTokenExp = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp,
      },
    })

    // await sendPasswordResetEmail(email, resetToken);

    return { success: "Password reset link sent to your email" }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { error: "Failed to process request" }
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return { error: "Invalid or expired token" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    })

    return { success: "Password reset successfully" }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Failed to reset password" }
  }
}

