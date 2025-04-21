import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, profileData } = body

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 })
    }

    // Create profile first
    const profile = await db.profile.create({
      data: {
        firstName: profileData.firstName,
        middleName: profileData.middleName,
        lastName: profileData.lastName,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined,
        gender: profileData.gender,
        nationality: profileData.nationality,
        maritalStatus: profileData.maritalStatus,
        religion: profileData.religion,
        church: profileData.church,
        responsibility: profileData.responsibility,
        referralSource: profileData.referralSource,
        physicallyDisabled: profileData.physicallyDisabled,
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
        role: "STUDENT", // Default role for registration
        profileId: profile.id,
      },
    })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during registration" }, { status: 500 })
  }
}
