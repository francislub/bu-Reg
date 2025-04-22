import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "5")

    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json({ success: true, announcements })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching announcements" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is a registrar
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "REGISTRAR") {
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
      },
    })

    return NextResponse.json({ success: true, announcement })
  } catch (error) {
    console.error("Announcement creation error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during announcement creation" },
      { status: 500 },
    )
  }
}
