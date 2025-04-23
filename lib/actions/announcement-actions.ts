"use server"

import { db } from "@/lib/db"

type Announcement = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// Check if the Announcement model exists in the Prisma schema
async function ensureAnnouncementModel() {
  try {
    // For MongoDB, we can't use $queryRaw to check if a table exists
    // Instead, we'll try to create the model if it doesn't exist

    // First, check if we can access the announcement model
    try {
      await db.announcement.findFirst()
      return true
    } catch (error) {
      console.error("Announcement model might not exist:", error)

      // If using MongoDB, we can't create tables dynamically
      // Return false to indicate the model doesn't exist
      return false
    }
  } catch (error) {
    console.error("Error checking announcement model:", error)
    return false
  }
}

export async function getAllAnnouncements() {
  try {
    const modelExists = await ensureAnnouncementModel()

    if (!modelExists) {
      console.warn("Announcement model does not exist in the database schema")
      return []
    }

    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return announcements
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return []
  }
}

export async function createAnnouncement(data: { title: string; content: string }) {
  try {
    const modelExists = await ensureAnnouncementModel()

    if (!modelExists) {
      console.error("Cannot create announcement: Announcement model does not exist")
      throw new Error("Announcement model does not exist in the database schema")
    }

    const announcement = await db.announcement.create({
      data,
    })
    return announcement
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

export async function updateAnnouncement(id: string, data: { title?: string; content?: string }) {
  try {
    const modelExists = await ensureAnnouncementModel()

    if (!modelExists) {
      throw new Error("Announcement model does not exist in the database schema")
    }

    const announcement = await db.announcement.update({
      where: { id },
      data,
    })
    return announcement
  } catch (error) {
    console.error("Error updating announcement:", error)
    throw error
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const modelExists = await ensureAnnouncementModel()

    if (!modelExists) {
      throw new Error("Announcement model does not exist in the database schema")
    }

    await db.announcement.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error("Error deleting announcement:", error)
    throw error
  }
}
