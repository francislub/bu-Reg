"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Calendar, CheckCircle, Clock, FileText, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  faculty: {
    id: string
    name: string
  } | null
  registrationStatus: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

interface Deadline {
  id: string
  title: string
  dueDate: string
  type: string
  courseId: string
  courseCode: string
}

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalCredits: 0,
    pendingApprovals: 0,
    upcomingDeadlines: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch student courses
      const coursesRes = await fetch(`/api/students/courses?studentId=${session.user.id}`)
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses)

      // Fetch notifications
      const notificationsRes = await fetch(`/api/students/notifications?studentId=${session.user.id}`)
      const notificationsData = await notificationsRes.json()
      setNotifications(notificationsData.notifications)

      // Fetch deadlines
      const deadlinesRes = await fetch(`/api/students/deadlines?studentId=${session.user.id}`)
      const deadlinesData = await deadlinesRes.json()
      setDeadlines(deadlinesData.deadlines)

      // Set stats
      const approvedCourses = coursesData.courses.filter((course) => course.registrationStatus === "APPROVED")
      const pendingCourses = coursesData.courses.filter((course) => course.registrationStatus === "PENDING")

      setStats({
        totalCourses: approvedCourses.length,
        totalCredits: approvedCourses.reduce((acc, course) => acc + course.credits, 0),
        pendingApprovals: pendingCourses.length,
        upcomingDeadlines: deadlinesData.deadlines.length,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      useToast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/students/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      })

      if (!res.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Sample data for the chart
  const gradeData = [
    { name: "CS101", grade: 85 },
    { name: "CS201", grade: 92 },
    { name: "CS301", grade: 78 },
    { name: "CS401", grade: 88 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Here's an overview of your courses and academic progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
            </div>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
              <p className="text-3xl font-bold">{stats.totalCredits}</p>
            </div>
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
              <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
            </div>
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
              <p className="text-3xl font-bold">{stats.upcomingDeadlines}</p>
            </div>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
          <TabsTrigger value="grades">Grade Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Loading courses...</p>
            ) : courses.filter((course) => course.registrationStatus === "APPROVED").length > 0 ? (
              courses
                .filter((course) => course.registrationStatus === "APPROVED")
                .map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{course.code}</CardTitle>
                        <Badge>{course.credits} Credits</Badge>
                      </div>
                      <CardDescription>{course.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Instructor:</span>
                          <span className="text-sm font-medium">{course.faculty?.name || "TBA"}</span>
                        </div>
                        <div className="mt-4">
                          <Link href={`/dashboard/courses/${course.id}`}>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">You don't have any approved courses yet.</p>
                <Link href="/dashboard/course-registration">
                  <Button variant="link" className="mt-2">
                    Register for Courses
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {courses.filter((course) => course.registrationStatus === "APPROVED").length > 0 && (
            <div className="flex justify-end">
              <Link href="/dashboard/my-courses">
                <Button variant="outline">View All Courses</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {!notification.read && <Badge variant="secondary">New</Badge>}
                        </div>
                        <p className="text-sm mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button size="sm" variant="outline" onClick={() => markNotificationAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end">
                <Link href="/dashboard/notifications">
                  <Button variant="outline">View All Notifications</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No notifications at the moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          {loading ? (
            <p>Loading deadlines...</p>
          ) : deadlines.length > 0 ? (
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <Card key={deadline.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{deadline.title}</h3>
                        <p className="text-sm text-muted-foreground">Course: {deadline.courseCode}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              new Date(deadline.dueDate) < new Date()
                                ? "destructive"
                                : new Date(deadline.dueDate).getTime() - new Date().getTime() < 86400000 * 3
                                  ? "warning"
                                  : "outline"
                            }
                          >
                            {new Date(deadline.dueDate).toLocaleDateString()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{deadline.type}</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/courses/${deadline.courseId}`}>
                        <Button variant="outline" size="sm">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end">
                <Link href="/dashboard/calendar">
                  <Button variant="outline">View Calendar</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No upcoming deadlines.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Overview</CardTitle>
              <CardDescription>Your current academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="grade" name="Grade" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

