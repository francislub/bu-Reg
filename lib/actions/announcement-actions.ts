"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAllAnnouncements() {
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

export async function getAnnouncementById(announcementId: string) {
  try {
    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
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

export async function createAnnouncement(data: { title: string; content: string }) {
  try {
    const announcement = await db.announcement.create({
      data: {
        title: data.title,
        content: data.content,
      },
    })

    revalidatePath("/dashboard/announcements")
    revalidatePath("/dashboard")
    return { success: true, announcement }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return { success: false, message: "Failed to create announcement" }
  }
}

export async function updateAnnouncement(announcementId: string, data: { title: string; content: string }) {
  try {
    const announcement = await db.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        content: data.content,
      },
    })

    revalidatePath("/dashboard/announcements")
    revalidatePath("/dashboard")
    return { success: true, announcement }
  } catch (error) {
    console.error("Error updating announcement:", error)
    return { success: false, message: "Failed to update announcement" }
  }
}

export async function deleteAnnouncement(announcementId: string) {
  try {
    await db.announcement.delete({
      where: { id: announcementId },
    })

    revalidatePath("/dashboard/announcements")
    revalidatePath("/dashboard")
    return { success: true, message: "Announcement deleted successfully" }
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return { success: false, message: "Failed to delete announcement" }
  }
}

export async function getRecentAnnouncements(limit = 5) {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return { success: true, announcements }
  } catch (error) {
    console.error("Error fetching recent announcements:", error)
    return { success: false, message: "Failed to fetch recent announcements" }
  }
}
