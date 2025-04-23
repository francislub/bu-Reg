"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createAnnouncement } from "@/lib/actions/announcement-actions"

// Define the schema for announcement creation
const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must be less than 5000 characters"),
})

export async function createAnnouncementAction(formData: FormData) {
  try {
    // Extract and validate the form data
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    // Validate the data
    const validatedData = announcementSchema.parse({ title, content })

    // Create the announcement
    await createAnnouncement(validatedData)

    // Revalidate the announcements page
    revalidatePath("/dashboard/announcements")

    return { success: true, message: "Announcement created successfully" }
  } catch (error) {
    console.error("Error creating announcement:", error)

    if (error instanceof z.ZodError) {
      // Return validation errors
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
      }
    }

    return { success: false, message: "Failed to create announcement" }
  }
}
