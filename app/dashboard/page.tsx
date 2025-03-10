import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/stats"
import { CourseChart } from "@/components/dashboard/course-chart"
import { NotificationList } from "@/components/dashboard/notification-list"
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines"
import { RecentRegistrations } from "@/components/dashboard/recent-registrations"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard :: Welcome to Bugema University - Student Portal</h1>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Course Registration Status</CardTitle>
            <CardDescription>Overview of your course registrations by semester</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Notifications</CardTitle>
            <CardDescription>Recent announcements and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationList />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingDeadlines />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Your recent course registration activities</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentRegistrations />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

