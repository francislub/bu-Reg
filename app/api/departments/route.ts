import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const departments = await db.department.findMany({
      include: {
        courses: true,
        departmentStaff: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, departments })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching departments" },
      { status: 500 },
    )
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
    const { name, code } = body

    // Check if department with same code already exists
    const existingDepartment = await db.department.findUnique({
      where: { code },
    })

    if (existingDepartment) {
      return NextResponse.json({ success: false, message: "Department with this code already exists" }, { status: 400 })
    }

    const department = await db.department.create({
      data: {
        name,
        code,
      },
    })

    return NextResponse.json({ success: true, department })
  } catch (error) {
    console.error("Department creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during department creation" },
      { status: 500 },
    )
  }
}
