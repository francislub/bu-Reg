import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get registration counts by month for the current year
    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1) // January 1st of current year

    const registrations = await prisma.registration.findMany({
      where: {
        registeredAt: {
          gte: startDate,
        },
      },
      select: {
        registeredAt: true,
      },
      orderBy: {
        registeredAt: "asc",
      },
    })

    // Group registrations by month
    const monthlyData = Array(12)
      .fill(0)
      .map((_, index) => ({
        month: new Date(currentYear, index, 1).toLocaleString("default", { month: "short" }),
        count: 0,
      }))

    registrations.forEach((reg) => {
      const month = new Date(reg.registeredAt).getMonth()
      monthlyData[month].count++
    })

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error("Error fetching registration trends:", error)
    return NextResponse.json({ error: "Failed to fetch registration trends" }, { status: 500 })
  }
}

