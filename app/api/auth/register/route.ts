import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import prisma from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { name, email, registrationNo, password, role = "STUDENT" } = await req.json()

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ message: "Invalid role specified" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { registrationNo }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or registration number already exists" },
        { status: 409 },
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        registrationNo,
        password: hashedPassword,
        role,
        profile: {
          create: {
            // Default profile data
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

