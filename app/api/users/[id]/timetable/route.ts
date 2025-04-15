import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
      orderBy: { startDate: "desc" },
    })

    if (!activeSemester) {
      return NextResponse.json({ message: "No active semester found" }, { status: 404 })
    }

    // Find published timetable for active semester
    const timetable = await prisma.timetable.findFirst({
      where: {
        semesterId: activeSemester.id,
        isPublished: true,
      },
      include: {
        semester: true,
      },
    })

    if (!timetable) {
      return NextResponse.json({ message: "No published timetable found for active semester" }, { status: 404 })
    }

    // Different logic based on user role
    if (user.role === userRoles.STUDENT) {
      // Get the student's registered courses
      const courseUploads = await prisma.courseUpload.findMany({
        where: {
          userId,
          semesterId: activeSemester.id,
          status: "APPROVED",
        },
        select: {
          courseId: true,
        },
      })

      const courseIds = courseUploads.map((upload) => upload.courseId)

      if (courseIds.length === 0) {
        return NextResponse.json({ message: "No registered courses found for this student" }, { status: 404 })
      }

      // Get timetable slots for student's courses
      const timetableSlots = await prisma.timetableSlot.findMany({
        where: {
          timetableId: timetable.id,
          courseId: {
            in: courseIds,
          },
        },
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
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })

      return NextResponse.json({
        timetable,
        slots: timetableSlots,
      })
    } else if (user.role === userRoles.STAFF) {
      // Get lecturer courses
      const lecturerCourses = await prisma.lecturerCourse.findMany({
        where: {
          lecturerId: userId,
          semesterId: activeSemester.id,
        },
        select: {
          id: true,
        },
      })

      if (lecturerCourses.length === 0) {
        return NextResponse.json({ message: "No assigned courses found for this lecturer" }, { status: 404 })
      }

      // Get timetable slots for lecturer's courses
      const timetableSlots = await prisma.timetableSlot.findMany({
        where: {
          timetableId: timetable.id,
          lecturerCourseId: {
            in: lecturerCourses.map((lc) => lc.id),
          },
        },
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
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })

      return NextResponse.json({
        timetable,
        slots: timetableSlots,
      })
    } else {
      return NextResponse.json({ message: "User role not supported for timetable view" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
