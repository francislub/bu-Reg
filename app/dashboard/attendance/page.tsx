import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AttendanceTable } from "@/components/dashboard/attendance-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
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
      <AttendanceTable />
    </DashboardShell>
  )
}
