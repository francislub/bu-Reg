import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const academicYears = await db.academicYear.findMany({
      include: {
        semesters: true,
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json({ success: true, academicYears })
  } catch (error) {
    console.error("Error fetching academic years:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching academic years" },
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
    const { name, startDate, endDate, isActive } = body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Name, start date, and end date are required" },
        { status: 400 },
      )
    }

    // If setting this academic year as active, deactivate all other academic years
    if (isActive) {
      await db.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const academicYear = await db.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    })

    return NextResponse.json({ success: true, academicYear })
  } catch (error) {
    console.error("Academic year creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during academic year creation" },
      { status: 500 },
    )
  }
}
