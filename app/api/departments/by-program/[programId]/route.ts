import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { programId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { programId } = params

    // First, get the program to verify it exists
    const program = await db.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    // Get the department associated with this program
    const department = await db.department.findUnique({
      where: { id: program.departmentId },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found for this program" }, { status: 404 })
    }

    return NextResponse.json({ departments: [department] })
  } catch (error) {
    console.error("Error fetching departments by program:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
