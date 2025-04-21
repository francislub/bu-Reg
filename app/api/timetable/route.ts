import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const semesterId = url.searchParams.get("semesterId")
    const published = url.searchParams.get("published")

    if (!semesterId) {
      return NextResponse.json({ success: false, message: "Semester ID is required" }, { status: 400 })
    }

    if (published === "true") {
      // Get published timetable for semester
      const timetable = await db.timetable.findFirst({
        where: {
          semesterId,
          isPublished: true,
        },
        include: {
          semester: true,
          slots: {
            include: {
              course: true,
              lecturerCourse: {
                include: {
                  lecturer: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!timetable) {
        return NextResponse.json(
          { success: false, message: "No published timetable found for this semester" },
          { status: 404 },
        )
      }

      return NextResponse.json({ success: true, timetable })
    } else {
      // Get all timetables for semester
      const timetables = await db.timetable.findMany({
        where: { semesterId },
        include: {
          semester: true,
          slots: {
            include: {
              course: true,
              lecturerCourse: {
                include: {
                  lecturer: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      return NextResponse.json({ success: true, timetables })
    }
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching timetable" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, semesterId, isPublished } = body

    // If setting this timetable as published, unpublish all other timetables for this semester
    if (isPublished) {
      await db.timetable.updateMany({
        where: {
          semesterId,
          isPublished: true,
        },
        data: { isPublished: false },
      })
    }

    // Create timetable
    const timetable = await db.timetable.create({
      data: {
        name,
        semesterId,
        isPublished: isPublished || false,
      },
    })

    return NextResponse.json({ success: true, timetable })
  } catch (error) {
    console.error("Timetable creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during timetable creation" },
      { status: 500 },
    )
  }
}
