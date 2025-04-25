import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const programs = await db.program.findMany({
      include: {
        department: true,
        programCourses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ success: true, programs })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching programs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, code, type, duration, departmentId, description } = body

    // Validate required fields
    if (!name || !code || !type || !duration || !departmentId) {
      return NextResponse.json(
        { success: false, message: "Name, code, type, duration, and department are required" },
        { status: 400 },
      )
    }

    // Check if program with same code already exists
    const existingProgram = await db.program.findUnique({
      where: { code },
    })

    if (existingProgram) {
      return NextResponse.json({ success: false, message: "Program with this code already exists" }, { status: 400 })
    }

    const program = await db.program.create({
      data: {
        name,
        code,
        type,
        duration,
        departmentId,
        description,
      },
    })

    return NextResponse.json({ success: true, program })
  } catch (error) {
    console.error("Program creation error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during program creation" }, { status: 500 })
  }
}
