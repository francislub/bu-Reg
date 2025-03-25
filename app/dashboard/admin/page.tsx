import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminChart } from "@/components/dashboard/admin-chart"
import { NotificationList } from "@/components/dashboard/notification-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Get admin data
  const admin = await prisma.admin.findFirst({
    where: { userId: session.user.id },
    include: { user: true },
  })

  if (!admin) {
    redirect("/login")
  }

  // Get pending registrations
  const pendingRegistrations = await prisma.registration.findMany({
    where: { status: "PENDING" },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Get course stats
  const courses = await prisma.course.findMany({
    where: { isActive: true },
  })

  // Get student stats
  const studentCount = await prisma.student.count()

  // Get notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Welcome, {admin.firstName} {admin.lastName}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Pending Registrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentCount}</div>
                <p className="text-xs text-muted-foreground">Registered in the system</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">Available for registration</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.filter((n) => !n.isRead).length}</div>
                <p className="text-xs text-muted-foreground">Unread notifications</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Registration Analytics</CardTitle>
                <CardDescription>Course registration distribution</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminChart />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Your latest updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationList notifications={notifications.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Course Registrations</CardTitle>
              <CardDescription>Review and approve student registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRegistrations.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 gap-4 p-4 font-medium">
                      <div>Student</div>
                      <div>Course Code</div>
                      <div className="col-span-2">Title</div>
                      <div>Date</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {pendingRegistrations.map((registration) => (
                        <div key={registration.id} className="grid grid-cols-6 gap-4 p-4">
                          <div>{registration.user.email}</div>
                          <div>{registration.course.courseCode}</div>
                          <div className="col-span-2">{registration.course.title}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(registration.createdAt)}</div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="h-8">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-destructive">
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href="/dashboard/admin/registrations">
                      <Button>View All Registrations</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-muted-foreground">There are no pending registrations to review.</p>
                  <Link href="/dashboard/admin/registrations">
                    <Button>View All Registrations</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Your notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList notifications={notifications} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

