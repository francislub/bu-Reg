"use server"

import { prisma } from "@/lib/db"
import { compare } from "bcrypt"
import type { UserRole } from "@prisma/client"

export async function authenticateUser(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    // Check password
    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: "Invalid credentials" }
    }

    // ✅ Removed verification check

    // Return user data with role
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "",
        role: user.role,
        registrationNo: user.registrationNo,
      },
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getRoleBasedRedirect(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard"
    case "FACULTY":
      return "/faculty/dashboard"
    case "STUDENT":
    default:
      return "/dashboard/profile"
  }
}
