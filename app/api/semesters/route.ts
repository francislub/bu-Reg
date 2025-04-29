import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const academicYearId = url.searchParams.get("academicYearId")

    const whereClause = academicYearId ? { academicYearId } : {}

    const semesters = await db.semester.findMany({
      where: whereClause,
      include: {
        academicYear: true,
        semesterCourses: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json({ success: true, semesters })
  } catch (error) {
    console.error("Error fetching semesters:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching semesters" }, { status: 500 })
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
    const { name, academicYearId, startDate, endDate, isActive } = body

    // Validate required fields
    if (!name || !academicYearId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Name, academic year, start date, and end date are required" },
        { status: 400 },
      )
    }

    // If setting this semester as active, deactivate all other semesters
    if (isActive) {
      await db.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    // Create semester without registrationDeadline and courseUploadDeadline
    const semester = await db.semester.create({
      data: {
        name,
        academicYearId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    })

    return NextResponse.json({ success: true, semester })
  } catch (error) {
    console.error("Semester creation error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during semester creation" }, { status: 500 })
  }
}
