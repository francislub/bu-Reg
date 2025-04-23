import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/announcements/[id]
 * Get a single announcement by ID
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const announcement = await db.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!announcement) {
      return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      announcement,
    })
  } catch (error) {
    console.error(`Error fetching announcement:`, error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching the announcement" },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/announcements/[id]
 * Update an announcement
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and authorized
    const session = await getServerSession(authOptions)
    if (!session || !["REGISTRAR", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await req.json()
    const { title, content } = body

    if (!title && !content) {
      return NextResponse.json(
        { success: false, message: "At least one field (title or content) must be provided" },
        { status: 400 },
      )
    }

    // Check if announcement exists
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id },
    })

    if (!existingAnnouncement) {
      return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 })
    }

    // Update the announcement
    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Announcement updated successfully",
      announcement,
    })
  } catch (error) {
    console.error(`Error updating announcement:`, error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the announcement" },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/announcements/[id]
 * Delete an announcement
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and authorized
    const session = await getServerSession(authOptions)
    if (!session || !["REGISTRAR", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Check if announcement exists
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id },
    })

    if (!existingAnnouncement) {
      return NextResponse.json({ success: false, message: "Announcement not found" }, { status: 404 })
    }

    // Delete the announcement
    await db.announcement.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    })
  } catch (error) {
    console.error(`Error deleting announcement:`, error)
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the announcement" },
      { status: 500 },
    )
  }
}
