import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcrypt"

// GET /api/users - Get all users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const where = role ? { role } : {}

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registrationNo: true,
        createdAt: true,
        profile: {
          select: {
            department: true,
            program: true,
            campus: true,
            yearOfStudy: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    const total = await prisma.user.count({ where })

    return NextResponse.json({
      users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role, registrationNo, profile } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
        registrationNo,
        profile: profile
          ? {
              create: {
                department: profile.department,
                program: profile.program,
                campus: profile.campus,
                yearOfStudy: profile.yearOfStudy,
                phoneNumber: profile.phoneNumber,
                address: profile.address,
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
                gender: profile.gender,
              },
            }
          : undefined,
      },
      include: {
        profile: true,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

