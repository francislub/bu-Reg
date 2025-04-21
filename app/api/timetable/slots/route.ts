import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is staff or registrar
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { timetableId, courseId, lecturerCourseId, dayOfWeek, startTime, endTime, roomNumber } = body

    // Check for time conflicts
    const existingSlots = await db.timetableSlot.findMany({
      where: {
        timetableId,
        dayOfWeek,
        OR: [
          {
            // New slot starts during an existing slot
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            // New slot ends during an existing slot
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            // New slot contains an existing slot
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    })

    if (existingSlots.length > 0) {
      return NextResponse.json(
        { success: false, message: "Time slot conflicts with existing schedule" },
        { status: 400 },
      )
    }

    // Create timetable slot
    const slot = await db.timetableSlot.create({
      data: {
        timetableId,
        courseId,
        lecturerCourseId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber,
      },
    })

    return NextResponse.json({ success: true, slot })
  } catch (error) {
    console.error("Timetable slot creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during timetable slot creation" },
      { status: 500 },
    )
  }
}
