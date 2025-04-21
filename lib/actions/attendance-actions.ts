"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createAttendanceSession(data: {
  courseId: string
  lecturerId: string
  semesterId: string
  date: Date
  startTime: string
  endTime: string
  topic?: string
}) {
  try {
    const session = await db.attendanceSession.create({
      data: {
        courseId: data.courseId,
        lecturerId: data.lecturerId,
        semesterId: data.semesterId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        topic: data.topic,
      },
    })

    revalidatePath("/dashboard/attendance")
    return { success: true, session }
  } catch (error) {
    console.error("Error creating attendance session:", error)
    return { success: false, message: "Failed to create attendance session" }
  }
}

export async function recordAttendance(
  sessionId: string,
  attendanceRecords: Array<{
    studentId: string
    status: string
    comments?: string
  }>,
) {
  try {
    // Create or update attendance records
    const records = await Promise.all(
      attendanceRecords.map(async (record) => {
        // Check if record already exists
        const existingRecord = await db.attendanceRecord.findUnique({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: record.studentId,
            },
          },
        })

        if (existingRecord) {
          // Update existing record
          return db.attendanceRecord.update({
            where: {
              sessionId_studentId: {
                sessionId,
                studentId: record.studentId,
              },
            },
            data: {
              status: record.status,
              comments: record.comments,
            },
          })
        } else {
          // Create new record
          return db.attendanceRecord.create({
            data: {
              sessionId,
              studentId: record.studentId,
              status: record.status,
              comments: record.comments,
            },
          })
        }
      }),
    )

    revalidatePath("/dashboard/attendance")
    return { success: true, records }
  } catch (error) {
    console.error("Error recording attendance:", error)
    return { success: false, message: "Failed to record attendance" }
  }
}

export async function getLecturerAttendanceSessions(lecturerId: string, semesterId?: string) {
  try {
    const sessions = await db.attendanceSession.findMany({
      where: {
        lecturerId,
        ...(semesterId ? { semesterId } : {}),
      },
      include: {
        course: true,
        semester: true,
        records: {
          include: {
            student: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return { success: true, sessions }
  } catch (error) {
    console.error("Error fetching lecturer attendance sessions:", error)
    return { success: false, message: "Failed to fetch attendance sessions" }
  }
}

export async function getStudentAttendance(studentId: string, semesterId?: string) {
  try {
    const records = await db.attendanceRecord.findMany({
      where: {
        studentId,
        session: {
          ...(semesterId ? { semesterId } : {}),
        },
      },
      include: {
        session: {
          include: {
            course: true,
            lecturer: {
              include: {
                profile: true,
              },
            },
            semester: true,
          },
        },
      },
      orderBy: {
        session: {
          date: "desc",
        },
      },
    })

    return { success: true, records }
  } catch (error) {
    console.error("Error fetching student attendance:", error)
    return { success: false, message: "Failed to fetch attendance records" }
  }
}

export async function getAttendanceSessionById(sessionId: string) {
  try {
    const session = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        lecturer: {
          include: {
            profile: true,
          },
        },
        semester: true,
        records: {
          include: {
            student: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    if (!session) {
      return { success: false, message: "Attendance session not found" }
    }

    return { success: true, session }
  } catch (error) {
    console.error("Error fetching attendance session:", error)
    return { success: false, message: "Failed to fetch attendance session" }
  }
}

export async function deleteAttendanceSession(sessionId: string) {
  try {
    await db.attendanceSession.delete({
      where: { id: sessionId },
    })

    revalidatePath("/dashboard/attendance")
    return { success: true, message: "Attendance session deleted successfully" }
  } catch (error) {
    console.error("Error deleting attendance session:", error)
    return { success: false, message: "Failed to delete attendance session" }
  }
}
