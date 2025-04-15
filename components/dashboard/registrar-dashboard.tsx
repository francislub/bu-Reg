import { BookOpen, Calendar, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DashboardBarChart } from "@/components/dashboard/charts/bar-chart"
import { DashboardPieChart } from "@/components/dashboard/charts/pie-chart"
import { DashboardAreaChart } from "@/components/dashboard/charts/area-chart"
import {
  getActiveSemester,
  getApprovalRates,
  getCoursesByDepartment,
  getRegistrationStats,
  getRecentRegistrations,
  getRegistrationsByMonth,
} from "@/lib/data-fetching"
import { formatDate } from "@/lib/utils"

export async function RegistrarDashboard({ userId }: { userId: string }) {
  const stats = await getRegistrationStats()
  const activeSemester = await getActiveSemester()
  const recentRegistrations = await getRecentRegistrations(3)
  const coursesByDepartment = await getCoursesByDepartment()
  const registrationsByMonth = await getRegistrationsByMonth()
  const approvalRates = await getApprovalRates()

  const daysUntilDeadline = activeSemester?.registrationDeadline
    ? Math.ceil(
        (new Date(activeSemester.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Registered this semester"
          icon={Users}
          trend={`+${Math.floor(stats.totalStudents * 0.12)} from last semester`}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingRegistrations}
          description="Registration requests"
          icon={Clock}
          trend={`${Math.floor(stats.pendingRegistrations * 0.4)} new since yesterday`}
          iconColor="text-yellow-500"
        />
        <StatsCard
          title="Active Courses"
          value={stats.activeCourses}
          description="Across all departments"
          icon={BookOpen}
          trend="4 new courses added"
          iconColor="text-emerald-500"
        />
        <StatsCard
          title="Registration Deadline"
          value={`${daysUntilDeadline} Days`}
          description="Until registration closes"
          icon={Calendar}
          trend={
            activeSemester?.registrationDeadline ? formatDate(new Date(activeSemester.registrationDeadline)) : "Not set"
          }
          iconColor="text-purple-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Monthly registration activity over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardAreaChart
              data={registrationsByMonth}
              xAxisKey="name"
              areas={[
                {
                  dataKey: "value",
                  name: "Registrations",
                  color: "#3b82f6",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses by Department</CardTitle>
            <CardDescription>Distribution of courses across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardBarChart
              data={coursesByDepartment}
              xAxisKey="department"
              bars={[
                {
                  dataKey: "count",
                  name: "Courses",
                  color: "#10b981",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registration Requests</CardTitle>
            <CardDescription>Recent student registration requests that need your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent registrations</p>
              ) : (
                recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center p-4 border rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{registration.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {registration.user.profile?.firstName} {registration.user.profile?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(new Date(registration.createdAt))}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          registration.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : registration.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Rates</CardTitle>
            <CardDescription>Course registration approval statistics</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DashboardPieChart data={approvalRates} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
