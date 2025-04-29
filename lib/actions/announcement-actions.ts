"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Get all announcements with optional pagination and filtering
 */
export async function getAllAnnouncements(options?: {
  limit?: number
  page?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}) {
  try {
    const { limit = 10, page = 1, search = "", sortBy = "createdAt", sortOrder = "desc" } = options || {}

    const skip = (page - 1) * limit

    // Build filter conditions
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await db.announcement.count({ where })

    // Get announcements without author information since it's not in the schema
    const announcements = await db.announcement.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    })

    return {
      success: true,
      announcements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return {
      success: false,
      message: "Failed to fetch announcements",
      announcements: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    }
  }
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: string) {
  try {
    const announcement = await db.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return {
        success: false,
        message: "Announcement not found",
        announcement: null,
      }
    }

    return {
      success: true,
      announcement,
    }
  } catch (error) {
    console.error(`Error fetching announcement with ID ${id}:`, error)
    return {
      success: false,
      message: "Failed to fetch announcement",
      announcement: null,
    }
  }
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(data: { title: string; content: string; authorId?: string }) {
  try {
    const announcement = await db.announcement.create({
      data,
    })

    // Revalidate the announcements page to show the new announcement
    revalidatePath("/dashboard/announcements")

    return {
      success: true,
      message: "Announcement created successfully",
      announcement,
    }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return {
      success: false,
      message: "Failed to create announcement",
      announcement: null,
    }
  }
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(id: string, data: { title?: string; content?: string }) {
  try {
    // Check if announcement exists
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id },
    })

    if (!existingAnnouncement) {
      return {
        success: false,
        message: "Announcement not found",
        announcement: null,
      }
    }

    const announcement = await db.announcement.update({
      where: { id },
      data,
    })

    // Revalidate the announcements page to show the updated announcement
    revalidatePath("/dashboard/announcements")

    return {
      success: true,
      message: "Announcement updated successfully",
      announcement,
    }
  } catch (error) {
    console.error(`Error updating announcement with ID ${id}:`, error)
    return {
      success: false,
      message: "Failed to update announcement",
      announcement: null,
    }
  }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string) {
  try {
    // Check if announcement exists
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id },
    })

    if (!existingAnnouncement) {
      return {
        success: false,
        message: "Announcement not found",
      }
    }

    await db.announcement.delete({
      where: { id },
    })

    // Revalidate the announcements page to remove the deleted announcement
    revalidatePath("/dashboard/announcements")

    return {
      success: true,
      message: "Announcement deleted successfully",
    }
  } catch (error) {
    console.error(`Error deleting announcement with ID ${id}:`, error)
    return {
      success: false,
      message: "Failed to delete announcement",
    }
  }
}

/**
 * Get recent announcements for dashboard
 */
export async function getRecentAnnouncements(limit = 5) {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return {
      success: true,
      announcements,
    }
  } catch (error) {
    console.error("Error fetching recent announcements:", error)
    return {
      success: false,
      message: "Failed to fetch recent announcements",
      announcements: [],
    }
  }
}
