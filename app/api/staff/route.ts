import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { hash } from "bcrypt"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password, departmentId, isHead, profileData } = body

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
        role: "STAFF",
        profileId: profile.id,
      },
    })

    // Create department staff entry
    await db.departmentStaff.create({
      data: {
        userId: user.id,
        departmentId,
        isHead,
      },
    })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    console.error("Staff creation error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during staff creation" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const staff = await db.user.findMany({
      where: { role: "STAFF" },
      include: {
        profile: true,
        departmentStaff: {
          include: {
            department: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, staff })
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching staff" }, { status: 500 })
  }
}
