import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // In a real-world scenario, these would be fetched from a monitoring service
    // For now, we'll generate realistic values
    const stats = {
      cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
      diskUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
      uptime: Math.floor(Math.random() * 30) + 5, // 5-35 days
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching system stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch system stats" }, { status: 500 })
  }
}
