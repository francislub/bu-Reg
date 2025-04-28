import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/announcements
 * Get all announcements with optional pagination and filtering
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit") || "10")
    const page = Number(url.searchParams.get("page") || "1")
    const search = url.searchParams.get("search") || ""
    const sortBy = url.searchParams.get("sortBy") || "createdAt"
    const sortOrder = (url.searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    // Build filter conditions
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as any } },
            { content: { contains: search, mode: "insensitive" as any } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await db.announcement.count({ where })

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get announcements
    const announcements = await db.announcement.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    })

    return NextResponse.json({
      success: true,
      announcements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching announcements" },
      { status: 500 },
    )
  }
}

/**
 * POST /api/announcements
 * Create a new announcement
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and authorized
    const session = await getServerSession(authOptions)
    if (!session || !["REGISTRAR", "STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, message: "Title and content are required" }, { status: 400 })
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        authorId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the announcement" },
      { status: 500 },
    )
  }
}
