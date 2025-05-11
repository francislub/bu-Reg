import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { programId: string } }) {
  try {
    const programId = params.programId

    if (!programId) {
      return NextResponse.json({ success: false, message: "Program ID is required" }, { status: 400 })
    }

    // First, get the program to verify it exists
    const program = await db.program.findUnique({
      where: { id: programId },
      include: { department: true }
    })

    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found" }, { status: 404 })
    }

    // If the program has a department, return it
    if (program.department) {
      const departments = [{
        id: program.department.id,
        name: program.department.name,
        code: program.department.code || ""
      }]
      
      return NextResponse.json({
        success: true,
        departments,
      })
    }

    // If no department is associated with the program
    return NextResponse.json({
      success: true,
      departments: [],
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch departments" }, { status: 500 })
  }
}
