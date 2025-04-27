import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { createBackup } from "@/lib/actions/backup-actions"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const backups = await db.backup.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, backups })
  } catch (error) {
    console.error("Error fetching backups:", error)
    return NextResponse.json({ success: false, message: "An error occurred while fetching backups" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const result = await createBackup()

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Failed to create backup" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, backup: result.backup })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json({ success: false, message: "An error occurred while creating backup" }, { status: 500 })
  }
}
