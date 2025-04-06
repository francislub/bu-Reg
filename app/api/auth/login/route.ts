import { NextResponse } from "next/server"
import { compare } from "bcrypt"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, password, expectedRole } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is verified (if you have this field)
    if (user.isVerified === false) {
      return NextResponse.json(
        { success: false, message: "Please verify your email before logging in" },
        { status: 403 },
      )
    }

    // Check role if expectedRole is provided
    if (expectedRole && user.role !== expectedRole) {
      const roleMessages = {
        STUDENT: "This login is for students only. Please use the appropriate login page.",
        FACULTY: "This login is for faculty members only. Please use the appropriate login page.",
        ADMIN: "This login is for administrators only. Please use the appropriate login page.",
      }

      return NextResponse.json(
        {
          success: false,
          message: roleMessages[expectedRole as keyof typeof roleMessages] || "Incorrect role for this login page",
          correctLoginUrl: getRoleBasedLoginUrl(user.role),
        },
        { status: 403 },
      )
    }

    // Get redirect URL based on role
    const redirectUrl = getRoleBasedRedirectUrl(user.role)

    // Success messages based on role
    const welcomeMessages = {
      STUDENT: "Welcome to your student portal!",
      FACULTY: "Welcome to the faculty portal!",
      ADMIN: "Welcome to the administration portal!",
    }

    return NextResponse.json({
      success: true,
      message: welcomeMessages[user.role as keyof typeof welcomeMessages] || "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationNo: user.registrationNo,
      },
      redirectUrl,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}

function getRoleBasedRedirectUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "FACULTY":
      return "/faculty/dashboard"
    case "STUDENT":
    default:
      return "/dashboard"
  }
}

function getRoleBasedLoginUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/auth/admin"
    case "FACULTY":
      return "/auth/faculty"
    case "STUDENT":
    default:
      return "/auth/login"
  }
}

