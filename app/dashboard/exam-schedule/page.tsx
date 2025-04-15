import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ExamScheduleView } from "@/components/dashboard/exam-schedule-view"

export default async function ExamSchedulePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Examination Schedule</h2>
        <p className="text-muted-foreground">View the examination timetable for the current semester</p>
      </div>
      <ExamScheduleView userId={session.user.id} userRole={session.user.role} />
    </div>
  )
}
