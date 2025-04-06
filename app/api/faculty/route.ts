import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcrypt"

// GET /api/faculty - Get all faculty members
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build where clause based on query params
    const where: any = {}
    if (department) where.department = department

    const faculty = await prisma.faculty.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        createdAt: true,
        updatedAt: true,
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    const total = await prisma.faculty.count({ where })

    return NextResponse.json({
      faculty,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 })
  }
}

// POST /api/faculty - Create a new faculty member
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, department } = body

    // Check if faculty member already exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: {
        email,
      },
    })

    if (existingFaculty) {
      return NextResponse.json({ error: "Faculty member with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create faculty member
    const faculty = await prisma.faculty.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
      },
    })

    // Remove password from response
    const { password: _, ...facultyWithoutPassword } = faculty

    return NextResponse.json(facultyWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating faculty:", error)
    return NextResponse.json({ error: "Failed to create faculty member" }, { status: 500 })
  }
}

