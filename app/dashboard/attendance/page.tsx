import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AttendanceManagement } from "@/components/dashboard/attendance-management"
import { userRoles } from "@/lib/utils"

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only staff (lecturers) can access this page
  if (session.user.role !== userRoles.STAFF) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance Management</h2>
        <p className="text-muted-foreground">Manage attendance for your courses and track student participation.</p>
      </div>
      <AttendanceManagement userId={session.user.id} />
    </div>
  )
}
