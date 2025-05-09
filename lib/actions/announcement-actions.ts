"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface CreateAnnouncementParams {
  title: string
  content: string
  authorId: string
}

export async function createAnnouncement(params: CreateAnnouncementParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return { success: false, message: "You must be logged in to create an announcement" }
    }

    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return { success: false, message: "You do not have permission to create announcements" }
    }

    const { title, content, authorId } = params

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        authorId,
      },
    })

    revalidatePath("/dashboard/announcements")

    return { success: true, announcement }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return { success: false, message: "Failed to create announcement" }
  }
}

export async function getAnnouncements() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, announcements }
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return { success: false, message: "Failed to fetch announcements" }
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const announcement = await db.announcement.findUnique({
      where: {
        id,
      },
    })

    if (!announcement) {
      return { success: false, message: "Announcement not found" }
    }

    return { success: true, announcement }
  } catch (error) {
    console.error("Error fetching announcement:", error)
    return { success: false, message: "Failed to fetch announcement" }
  }
}

export async function updateAnnouncement(id: string, data: { title?: string; content?: string }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return { success: false, message: "You must be logged in to update an announcement" }
    }

    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return { success: false, message: "You do not have permission to update announcements" }
    }

    const announcement = await db.announcement.update({
      where: {
        id,
      },
      data,
    })

    revalidatePath("/dashboard/announcements")

    return { success: true, announcement }
  } catch (error) {
    console.error("Error updating announcement:", error)
    return { success: false, message: "Failed to update announcement" }
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return { success: false, message: "You must be logged in to delete an announcement" }
    }

    if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      return { success: false, message: "You do not have permission to delete announcements" }
    }

    await db.announcement.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/announcements")

    return { success: true }
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return { success: false, message: "Failed to delete announcement" }
  }
}
