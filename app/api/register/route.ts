import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, profileData } = body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    // Validate role - only allow specific roles
    const validRole = role === "ADMIN" || role === "REGISTRAR" || role === "STAFF" || role === "STUDENT"
    const assignedRole = validRole ? role : "STUDENT" // Default to STUDENT if invalid role

    // Create profile first with safe access to profileData
    const profile = await db.profile.create({
      data: {
        firstName: profileData?.firstName || name.split(" ")[0] || "",
        middleName: profileData?.middleName || "",
        lastName: profileData?.lastName || name.split(" ").slice(1).join(" ") || "",
        dateOfBirth: profileData?.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
        gender: profileData?.gender || "",
        nationality: profileData?.nationality || "",
        maritalStatus: profileData?.maritalStatus || "",
        religion: profileData?.religion || "",
        church: profileData?.church || "",
        responsibility: profileData?.responsibility || "",
        referralSource: profileData?.referralSource || "",
        physicallyDisabled: profileData?.physicallyDisabled || false,
      },
    })

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user with profile reference
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole, // Use the validated role
        profileId: profile.id,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during registration" }, { status: 500 })
  }
}
