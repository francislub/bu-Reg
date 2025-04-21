import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Welcome to your Bugema University dashboard." />
      <div className="grid gap-6">
        <DashboardCards />
        <div className="grid gap-6 md:grid-cols-2">
          <RecentAnnouncements />
          <UpcomingEvents />
        </div>
      </div>
    </DashboardShell>
  )
}
