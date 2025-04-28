import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const programId = params.id

    const program = await db.program.findUnique({
      where: {
        id: programId,
      },
      include: {
        department: true,
        programCourses: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    })

    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, program })
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching program" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const programId = params.id
    const body = await req.json()
    const { name, code, type, duration, departmentId, description } = body

    // Validate required fields
    if (!name || !code || !type || !duration || !departmentId) {
      return NextResponse.json(
        { success: false, message: "Name, code, type, duration, and department are required" },
        { status: 400 },
      )
    }

    // Check if another program with same code already exists
    const existingProgram = await db.program.findFirst({
      where: {
        code,
        NOT: {
          id: programId,
        },
      },
    })

    if (existingProgram) {
      return NextResponse.json(
        { success: false, message: "Another program with this code already exists" },
        { status: 400 },
      )
    }

    const program = await db.program.update({
      where: {
        id: programId,
      },
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
    console.error("Program update error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during program update" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const programId = params.id

    // Check if program exists
    const program = await db.program.findUnique({
      where: {
        id: programId,
      },
      include: {
        programCourses: true,
      },
    })

    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 })
    }

    // Delete all program courses first
    if (program.programCourses.length > 0) {
      await db.programCourse.deleteMany({
        where: {
          programId,
        },
      })
    }

    // Delete the program
    await db.program.delete({
      where: {
        id: programId,
      },
    })

    return NextResponse.json({ success: true, message: "Program deleted successfully" })
  } catch (error) {
    console.error("Program deletion error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during program deletion" }, { status: 500 })
  }
}
