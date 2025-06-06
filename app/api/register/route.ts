import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email" // Add this import

// Update the POST function to properly handle programId and departmentId
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
        program: profileData?.programId
          ? (await db.program.findUnique({ where: { id: profileData.programId } }))?.name || ""
          : "",
        programId: profileData?.programId || undefined,
        departmentId: profileData?.departmentId || undefined,
        phone: profileData?.phone || "",
        address: profileData?.address || "",
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

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Continue with registration even if email fails
    }

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
