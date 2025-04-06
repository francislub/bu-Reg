import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseChart } from "@/components/dashboard/course-chart"
import { NotificationList } from "@/components/dashboard/notification-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/auth/login")
  }

  // Get student data
  const student = await prisma.student.findFirst({
    where: { userId: session.user.id },
    include: { user: true },
  })

  if (!student) {
    redirect("/auth/login")
  }

  // Get student registrations
  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  // Get notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Welcome, {student.firstName} {student.lastName}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.length}</div>
                <p className="text-xs text-muted-foreground">Across all semesters</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.filter((r) => r.status === "PENDING").length}</div>
                <p className="text-xs text-muted-foreground">Awaiting admin approval</p>
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
                <CardTitle>Course Chart</CardTitle>
                <CardDescription>Your course distribution by semester</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <CourseChart />
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
              <CardTitle>Course Registrations</CardTitle>
              <CardDescription>Manage your course registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                      <div>Course Code</div>
                      <div className="col-span-2">Title</div>
                      <div>Status</div>
                      <div>Date</div>
                    </div>
                    <div className="divide-y">
                      {registrations.map((registration) => (
                        <div key={registration.id} className="grid grid-cols-5 gap-4 p-4">
                          <div>{registration.course.courseCode}</div>
                          <div className="col-span-2">{registration.course.title}</div>
                          <div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                registration.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : registration.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {registration.status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">{formatDate(registration.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href="/dashboard/student/courses">
                      <Button>Register for Courses</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-muted-foreground">You haven&apos;t registered for any courses yet.</p>
                  <Link href="/dashboard/student/courses">
                    <Button>Register for Courses</Button>
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

