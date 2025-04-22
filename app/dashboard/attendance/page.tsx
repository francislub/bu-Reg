import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AttendanceTable } from "@/components/dashboard/attendance-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { db } from "@/lib/db"

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch attendance data based on user role
  let attendanceData = []

  try {
    if (session.user.role === "STUDENT") {
      // For students, fetch their attendance records
      attendanceData = await db.attendanceRecord.findMany({
        where: {
          studentId: session.user.id,
        },
        include: {
          session: {
            include: {
              course: true,
              lecturer: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          session: {
            date: "desc",
          },
        },
      })
    } else if (session.user.role === "STAFF") {
      // For staff, fetch sessions they've created
      attendanceData = await db.attendanceSession.findMany({
        where: {
          lecturerId: session.user.id,
        },
        include: {
          course: true,
          records: {
            include: {
              student: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      })
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error)
    // Return empty array if there's an error
    attendanceData = []
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Attendance" text="Manage course attendance.">
        {session.user.role === "STAFF" && (
          <Button className="ml-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Attendance
          </Button>
        )}
      </DashboardHeader>
      <AttendanceTable initialData={attendanceData} userRole={session.user.role} />
    </DashboardShell>
  )
}
