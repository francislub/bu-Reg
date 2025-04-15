import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AcademicCalendarView } from "@/components/dashboard/academic-calendar-view"

export default async function AcademicCalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Academic Calendar</h2>
        <p className="text-muted-foreground">View important academic dates and events for the current year</p>
      </div>
      <AcademicCalendarView />
    </div>
  )
}
