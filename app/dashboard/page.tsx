import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, BookOpen, Calendar, FileText, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userRole = session.user.role

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {session.user.name}</h2>
        <p className="text-muted-foreground">Here's an overview of your {userRole.toLowerCase()} dashboard</p>
      </div>

      {userRole === userRoles.REGISTRAR && <RegistrarDashboard userId={session.user.id} />}
      {userRole === userRoles.STAFF && <StaffDashboard userId={session.user.id} />}
      {userRole === userRoles.STUDENT && <StudentDashboard userId={session.user.id} />}
    </div>
  )
}

function RegistrarDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total Students"
        value="1,248"
        description="Registered this semester"
        icon={Users}
        trend="+12% from last semester"
      />
      <DashboardCard
        title="Pending Approvals"
        value="42"
        description="Registration requests"
        icon={Clock}
        trend="18 new since yesterday"
      />
      <DashboardCard
        title="Active Courses"
        value="86"
        description="Across all departments"
        icon={BookOpen}
        trend="4 new courses added"
      />
      <DashboardCard
        title="Registration Deadline"
        value="14 Days"
        description="Until registration closes"
        icon={Calendar}
        trend="April 30, 2025"
      />

      <div className="md:col-span-2 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registration Approvals</CardTitle>
            <CardDescription>Recent student registration requests that need your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ApprovalItem name="John Doe" department="Computer Science" date="2 hours ago" status="pending" />
                <ApprovalItem
                  name="Jane Smith"
                  department="Business Administration"
                  date="3 hours ago"
                  status="pending"
                />
                <ApprovalItem name="Michael Johnson" department="Engineering" date="5 hours ago" status="approved" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StaffDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Department Students"
        value="324"
        description="Currently registered"
        icon={Users}
        trend="+8% from last semester"
      />
      <DashboardCard
        title="Pending Approvals"
        value="18"
        description="Course registrations"
        icon={Clock}
        trend="7 new since yesterday"
      />
      <DashboardCard
        title="Department Courses"
        value="24"
        description="Active this semester"
        icon={BookOpen}
        trend="2 new courses added"
      />
      <DashboardCard
        title="Approved Registrations"
        value="286"
        description="This semester"
        icon={CheckCircle}
        trend="92% approval rate"
      />

      <div className="md:col-span-2 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Course Approvals</CardTitle>
            <CardDescription>Recent course registration requests from students in your department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ApprovalItem
                  name="Alice Williams"
                  department="Computer Science"
                  date="1 hour ago"
                  status="pending"
                  course="CS401: Advanced Algorithms"
                />
                <ApprovalItem
                  name="Bob Brown"
                  department="Computer Science"
                  date="3 hours ago"
                  status="pending"
                  course="CS302: Database Systems"
                />
                <ApprovalItem
                  name="Carol Davis"
                  department="Computer Science"
                  date="4 hours ago"
                  status="approved"
                  course="CS201: Data Structures"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StudentDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Registered Courses"
        value="5"
        description="Current semester"
        icon={BookOpen}
        trend="15 credit hours"
      />
      <DashboardCard
        title="Pending Approvals"
        value="2"
        description="Course registrations"
        icon={Clock}
        trend="Submitted 2 days ago"
      />
      <DashboardCard
        title="Registration Status"
        value="In Progress"
        description="Current semester"
        icon={FileText}
        trend="3/5 courses approved"
      />
      <DashboardCard
        title="Registration Deadline"
        value="14 Days"
        description="Until registration closes"
        icon={Calendar}
        trend="April 30, 2025"
      />

      <div className="md:col-span-2 lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Your registered courses for the current semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CourseItem code="CS401" title="Advanced Algorithms" credits={3} status="approved" />
                <CourseItem code="CS302" title="Database Systems" credits={4} status="approved" />
                <CourseItem code="CS350" title="Software Engineering" credits={3} status="pending" />
                <CourseItem code="CS310" title="Computer Networks" credits={3} status="approved" />
                <CourseItem code="CS405" title="Artificial Intelligence" credits={3} status="pending" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  description: string
  icon: any
  trend: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-2">{trend}</p>
      </CardContent>
    </Card>
  )
}

function ApprovalItem({
  name,
  department,
  date,
  status,
  course,
}: {
  name: string
  department: string
  date: string
  status: "pending" | "approved" | "rejected"
  course?: string
}) {
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{department}</p>
        {course && <p className="text-xs text-muted-foreground">{course}</p>}
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  )
}

function CourseItem({
  code,
  title,
  credits,
  status,
}: {
  code: string
  title: string
  credits: number
  status: "pending" | "approved" | "rejected"
}) {
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">
          {code}: {title}
        </p>
        <p className="text-xs text-muted-foreground">{credits} Credit Hours</p>
      </div>
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "approved"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  )
}
