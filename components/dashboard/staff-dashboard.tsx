import { BookOpen, CheckCircle, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DashboardBarChart } from "@/components/dashboard/charts/bar-chart"
import { DashboardPieChart } from "@/components/dashboard/charts/pie-chart"
import { getApprovalRates, getDepartmentCourseUploads, getDepartmentStats } from "@/lib/data-fetching"
import { formatDate } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export async function StaffDashboard({ userId }: { userId: string }) {
  // Get staff department
  const staffDepartment = await prisma.departmentStaff.findFirst({
    where: { userId },
    include: { department: true },
  })

  if (!staffDepartment) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800">Department Not Assigned</h3>
        <p className="text-yellow-700 mt-2">
          You haven't been assigned to a department yet. Please contact the registrar to assign you to a department.
        </p>
      </div>
    )
  }

  const departmentId = staffDepartment.departmentId
  const stats = await getDepartmentStats(departmentId)
  const recentUploads = await getDepartmentCourseUploads(departmentId, 3)
  const approvalRates = await getApprovalRates()

  // Mock data for course distribution chart
  const courseDistribution = [
    { name: "First Year", count: 12 },
    { name: "Second Year", count: 15 },
    { name: "Third Year", count: 10 },
    { name: "Fourth Year", count: 8 },
  ]

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-blue-800">Department: {staffDepartment.department.name}</h3>
        <p className="text-blue-700 mt-1">{staffDepartment.isHead ? "Department Head" : "Department Staff"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Department Students"
          value={stats.departmentStudents}
          description="Currently registered"
          icon={Users}
          trend={`+${Math.floor(stats.departmentStudents * 0.08)} from last semester`}
          iconColor="text-indigo-500"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          description="Course registrations"
          icon={Clock}
          trend={`${Math.floor(stats.pendingApprovals * 0.3)} new since yesterday`}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Department Courses"
          value={stats.departmentCourses}
          description="Active this semester"
          icon={BookOpen}
          trend="2 new courses added"
          iconColor="text-teal-500"
        />
        <StatsCard
          title="Approved Registrations"
          value={stats.approvedRegistrations}
          description="This semester"
          icon={CheckCircle}
          trend={`${Math.round((stats.approvedRegistrations / (stats.approvedRegistrations + stats.pendingApprovals)) * 100)}% approval rate`}
          iconColor="text-green-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Distribution</CardTitle>
            <CardDescription>Distribution of courses by year level</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardBarChart
              data={courseDistribution}
              xAxisKey="name"
              bars={[
                {
                  dataKey: "count",
                  name: "Courses",
                  color: "#8b5cf6",
                },
              ]}
            />
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Course Approvals</CardTitle>
          <CardDescription>Recent course registration requests from students in your department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUploads.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent course uploads</p>
            ) : (
              recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{upload.user.name}</p>
                    <p className="text-xs font-medium">
                      {upload.course.code}: {upload.course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(new Date(upload.createdAt))}</p>
                  </div>
                  <div>
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
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
