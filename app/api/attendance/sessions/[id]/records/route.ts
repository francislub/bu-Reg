import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { userRoles } from "@/lib/utils"

const attendanceRecordSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE"]),
      comments: z.string().optional(),
    }),
  ),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== userRoles.STAFF) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if session exists and belongs to this lecturer
    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: {
        id: params.id,
        lecturerId: session.user.id,
      },
    })

    if (!attendanceSession) {
      return NextResponse.json({ message: "Attendance session not found or unauthorized" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = attendanceRecordSchema.parse(body)

    // Delete existing records for this session
    await prisma.attendanceRecord.deleteMany({
      where: {
        sessionId: params.id,
      },
    })

    // Create new records in a transaction
    const records = await prisma.$transaction(
      validatedData.records.map((record) =>
        prisma.attendanceRecord.create({
          data: {
            sessionId: params.id,
            studentId: record.studentId,
            status: record.status,
            comments: record.comments,
          },
        }),
      ),
    )

    return NextResponse.json(
      {
        message: "Attendance records saved successfully",
        count: records.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving attendance records:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
