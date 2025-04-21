"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createTimetable(data: { name: string; semesterId: string; isPublished?: boolean }) {
  try {
    const timetable = await db.timetable.create({
      data: {
        name: data.name,
        semesterId: data.semesterId,
        isPublished: data.isPublished || false,
      },
    })

    revalidatePath("/dashboard/timetable")
    return { success: true, timetable }
  } catch (error) {
    console.error("Error creating timetable:", error)
    return { success: false, message: "Failed to create timetable" }
  }
}

export async function updateTimetable(timetableId: string, data: { name: string; isPublished: boolean }) {
  try {
    const timetable = await db.timetable.update({
      where: { id: timetableId },
      data: {
        name: data.name,
        isPublished: data.isPublished,
      },
    })

    revalidatePath("/dashboard/timetable")
    return { success: true, timetable }
  } catch (error) {
    console.error("Error updating timetable:", error)
    return { success: false, message: "Failed to update timetable" }
  }
}

export async function deleteTimetable(timetableId: string) {
  try {
    await db.timetable.delete({
      where: { id: timetableId },
    })

    revalidatePath("/dashboard/timetable")
    return { success: true, message: "Timetable deleted successfully" }
  } catch (error) {
    console.error("Error deleting timetable:", error)
    return { success: false, message: "Failed to delete timetable" }
  }
}

export async function addTimetableSlot(data: {
  timetableId: string
  courseId: string
  lecturerCourseId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomNumber: string
}) {
  try {
    // Check for time conflicts
    const existingSlots = await db.timetableSlot.findMany({
      where: {
        timetableId: data.timetableId,
        dayOfWeek: data.dayOfWeek,
        OR: [
          {
            // New slot starts during an existing slot
            startTime: { lte: data.startTime },
            endTime: { gt: data.startTime },
          },
          {
            // New slot ends during an existing slot
            startTime: { lt: data.endTime },
            endTime: { gte: data.endTime },
          },
          {
            // New slot contains an existing slot
            startTime: { gte: data.startTime },
            endTime: { lte: data.endTime },
          },
        ],
      },
    })

    if (existingSlots.length > 0) {
      return { success: false, message: "Time slot conflicts with existing schedule" }
    }

    const slot = await db.timetableSlot.create({
      data: {
        timetableId: data.timetableId,
        courseId: data.courseId,
        lecturerCourseId: data.lecturerCourseId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        roomNumber: data.roomNumber,
      },
    })

    revalidatePath("/dashboard/timetable")
    return { success: true, slot }
  } catch (error) {
    console.error("Error adding timetable slot:", error)
    return { success: false, message: "Failed to add timetable slot" }
  }
}

export async function updateTimetableSlot(
  slotId: string,
  data: {
    courseId: string
    lecturerCourseId?: string
    dayOfWeek: number
    startTime: string
    endTime: string
    roomNumber: string
  },
) {
  try {
    // Check for time conflicts with other slots
    const existingSlots = await db.timetableSlot.findMany({
      where: {
        id: { not: slotId },
        dayOfWeek: data.dayOfWeek,
        OR: [
          {
            // New slot starts during an existing slot
            startTime: { lte: data.startTime },
            endTime: { gt: data.startTime },
          },
          {
            // New slot ends during an existing slot
            startTime: { lt: data.endTime },
            endTime: { gte: data.endTime },
          },
          {
            // New slot contains an existing slot
            startTime: { gte: data.startTime },
            endTime: { lte: data.endTime },
          },
        ],
      },
    })

    if (existingSlots.length > 0) {
      return { success: false, message: "Time slot conflicts with existing schedule" }
    }

    const slot = await db.timetableSlot.update({
      where: { id: slotId },
      data: {
        courseId: data.courseId,
        lecturerCourseId: data.lecturerCourseId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        roomNumber: data.roomNumber,
      },
    })

    revalidatePath("/dashboard/timetable")
    return { success: true, slot }
  } catch (error) {
    console.error("Error updating timetable slot:", error)
    return { success: false, message: "Failed to update timetable slot" }
  }
}

export async function deleteTimetableSlot(slotId: string) {
  try {
    await db.timetableSlot.delete({
      where: { id: slotId },
    })

    revalidatePath("/dashboard/timetable")
    return { success: true, message: "Timetable slot deleted successfully" }
  } catch (error) {
    console.error("Error deleting timetable slot:", error)
    return { success: false, message: "Failed to delete timetable slot" }
  }
}

export async function getTimetablesBySemester(semesterId: string) {
  try {
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

    return { success: true, timetables }
  } catch (error) {
    console.error("Error fetching timetables:", error)
    return { success: false, message: "Failed to fetch timetables" }
  }
}

export async function getPublishedTimetable(semesterId: string) {
  try {
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
      return { success: false, message: "No published timetable found for this semester" }
    }

    return { success: true, timetable }
  } catch (error) {
    console.error("Error fetching published timetable:", error)
    return { success: false, message: "Failed to fetch published timetable" }
  }
}
