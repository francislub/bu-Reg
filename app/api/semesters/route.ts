import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const semesters = await db.semester.findMany({
      include: {
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
    const { name, startDate, endDate, isActive, registrationDeadline, courseUploadDeadline } = body

    // If setting this semester as active, deactivate all other semesters
    if (isActive) {
      await db.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const semester = await db.semester.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        courseUploadDeadline: courseUploadDeadline ? new Date(courseUploadDeadline) : undefined,
      },
    })

    return NextResponse.json({ success: true, semester })
  } catch (error) {
    console.error("Semester creation error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during semester creation" }, { status: 500 })
  }
}
