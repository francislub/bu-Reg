import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "REGISTRAR") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const url = new URL(req.url)
    const semesterId = url.searchParams.get("semesterId")
    const programId = url.searchParams.get("programId")
    const status = url.searchParams.get("status")

    if (!semesterId) {
      return new NextResponse(JSON.stringify({ error: "Semester ID is required" }), {
        status: 400,
      })
    }

    // Build where clause based on parameters
    const whereClause: any = {
      semesterId,
    }

    if (status) {
      whereClause.status = status
    }

    // Get registrations
    const registrations = await db.registration.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Filter by program if specified
    let filteredRegistrations = registrations
    if (programId) {
      filteredRegistrations = registrations.filter((reg) => reg.user.profile?.programId === programId)
    }

    // Calculate summary statistics
    const totalRegistrations = filteredRegistrations.length
    const approvedRegistrations = filteredRegistrations.filter((r) => r.status === "APPROVED").length
    const pendingRegistrations = filteredRegistrations.filter((r) => r.status === "PENDING").length
    const rejectedRegistrations = filteredRegistrations.filter((r) => r.status === "REJECTED").length

    // Group by program
    const programCounts: Record<string, number> = {}
    filteredRegistrations.forEach((reg) => {
      const programName = reg.user.profile?.program || "Unknown Program"
      programCounts[programName] = (programCounts[programName] || 0) + 1
    })

    // Get semester details
    const semester = await db.semester.findUnique({
      where: { id: semesterId },
      include: {
        academicYear: true,
      },
    })

    return NextResponse.json({
      semester,
      summary: {
        totalRegistrations,
        approvedRegistrations,
        pendingRegistrations,
        rejectedRegistrations,
        programCounts,
      },
      registrations: filteredRegistrations,
    })
  } catch (error) {
    console.error("Error generating registration report:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to generate report" }), {
      status: 500,
    })
  }
}
