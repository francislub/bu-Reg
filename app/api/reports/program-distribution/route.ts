import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester") || "fall2023"
    const academicYear = searchParams.get("academicYear") || "2023-2024"

    // Get student counts by program
    const registrations = await prisma.registration.findMany({
      where: {
        semester,
        academicYear,
        status: "APPROVED",
      },
      include: {
        student: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Group students by program
    const programCounts = {}
    registrations.forEach((reg) => {
      const program = reg.student.profile?.program || "Undeclared"
      programCounts[program] = (programCounts[program] || 0) + 1
    })

    // Convert to array format for chart
    const programData = Object.entries(programCounts).map(([program, count]) => ({
      program,
      count,
    }))

    // Sort by count in descending order
    programData.sort((a, b) => b.count - a.count)

    return NextResponse.json(programData)
  } catch (error) {
    console.error("Error fetching program distribution:", error)
    return NextResponse.json({ error: "Failed to fetch program distribution" }, { status: 500 })
  }
}

