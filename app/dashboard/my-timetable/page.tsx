import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { StudentTimetable } from "@/components/dashboard/student-timetable"
import { StaffTimetable } from "@/components/dashboard/staff-timetable"
import { userRoles } from "@/lib/utils"

export default async function MyTimetablePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Timetable</h1>
        <p className="text-muted-foreground">View your class schedule for the current semester</p>
      </div>

      {session.user.role === userRoles.STUDENT ? (
        <StudentTimetable userId={session.user.id} />
      ) : (
        <StaffTimetable userId={session.user.id} />
      )}
    </div>
  )
}
