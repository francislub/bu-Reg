import { BookOpen, Calendar, Clock, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DashboardPieChart } from "@/components/dashboard/charts/pie-chart"
import { DashboardBarChart } from "@/components/dashboard/charts/bar-chart"
import { getActiveSemester, getStudentCourses, getStudentStats } from "@/lib/data-fetching"
import { formatDate } from "@/lib/utils"

export async function StudentDashboard({ userId }: { userId: string }) {
  const stats = await getStudentStats(userId)
  const activeSemester = await getActiveSemester()
  const studentCourses = await getStudentCourses(userId)

  const daysUntilDeadline = activeSemester?.registrationDeadline
    ? Math.ceil(
        (new Date(activeSemester.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0

  // Data for course status chart
  const courseStatusData = [
    { name: "Approved", value: stats.approvedCourses, color: "#4ade80" },
    { name: "Pending", value: stats.pendingCourses, color: "#facc15" },
  ]

  // Data for credits by department chart
  const creditsByDepartment = studentCourses.reduce((acc: any[], upload) => {
    const deptName = upload.course.department.name
    const existingDept = acc.find((item) => item.name === deptName)

    if (existingDept) {
      existingDept.credits += upload.course.credits
    } else {
      acc.push({
        name: deptName,
        credits: upload.course.credits,
      })
    }

    return acc
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Registered Courses"
          value={stats.registeredCourses}
          description="Current semester"
          icon={BookOpen}
          trend={`${stats.totalCredits} credit hours`}
          iconColor="text-cyan-500"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingCourses}
          description="Course registrations"
          icon={Clock}
          trend="Awaiting approval"
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Registration Status"
          value={stats.approvedCourses > 0 ? "In Progress" : "Not Started"}
          description="Current semester"
          icon={FileText}
          trend={`${stats.approvedCourses}/${stats.registeredCourses} courses approved`}
          iconColor="text-violet-500"
        />
        <StatsCard
          title="Registration Deadline"
          value={`${daysUntilDeadline} Days`}
          description="Until registration closes"
          icon={Calendar}
          trend={
            activeSemester?.registrationDeadline ? formatDate(new Date(activeSemester.registrationDeadline)) : "Not set"
          }
          iconColor="text-rose-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Status</CardTitle>
            <CardDescription>Status of your course registrations</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DashboardPieChart data={courseStatusData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits by Department</CardTitle>
            <CardDescription>Distribution of credit hours by department</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardBarChart
              data={creditsByDepartment}
              xAxisKey="name"
              bars={[
                {
                  dataKey: "credits",
                  name: "Credit Hours",
                  color: "#06b6d4",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Your registered courses for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses registered</p>
                <p className="text-xs text-muted-foreground mt-2">Register for courses to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentCourses.map((upload) => (
                  <div key={upload.id} className="flex flex-col p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium">{upload.course.code}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          upload.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : upload.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{upload.course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.course.credits} Credit Hours | {upload.course.department.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
