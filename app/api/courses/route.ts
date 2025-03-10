import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")

    const whereClause: any = {}

    if (semester) {
      whereClause.semester = semester
    }

    if (academicYear) {
      whereClause.academicYear = academicYear
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const course = await prisma.course.create({
      data,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

