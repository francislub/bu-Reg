import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { StudentAttendanceView } from "@/components/dashboard/student-attendance-view"
import { userRoles } from "@/lib/utils"

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only students can access this page
  if (session.user.role !== userRoles.STUDENT) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Attendance</h2>
        <p className="text-muted-foreground">View your attendance records for the current semester.</p>
      </div>
      <StudentAttendanceView userId={session.user.id} />
    </div>
  )
}
