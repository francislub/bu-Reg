"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, BookOpen, Clock, GraduationCap, Bell, Calendar } from "lucide-react"
import { getStudentCourses } from "@/lib/actions/course-actions"
import { getStudentApprovals } from "@/lib/actions/registration-actions"

interface StudentDashboardProps {
  user: any
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch student courses
        const coursesResult = await getStudentCourses(user.id)
        if (coursesResult.success) {
          setCourses(coursesResult.courseUploads)
        }

        // Fetch student approvals
        const approvalsResult = await getStudentApprovals(user.id)
        if (approvalsResult.success) {
          setApprovals(approvalsResult.approvals)
        }
      } catch (error) {
        console.error("Error fetching student dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user])

  // Get approved courses
  const approvedCourses = courses.filter(
    (course) => course.approvals && course.approvals.length > 0 && course.approvals[0].status === "APPROVED",
  )

  // Get pending courses
  const pendingCourses = courses.filter(
    (course) => !course.approvals || course.approvals.length === 0 || course.approvals[0].status === "PENDING",
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {approvedCourses.length === 1 ? "course" : "courses"} approved this semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCourses.length === 1 ? "course" : "courses"} awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Average attendance rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5</div>
            <p className="text-xs text-muted-foreground">Current semester GPA</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Registered Courses</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Semester Courses</CardTitle>
              <CardDescription>
                Your registered courses for the current semester. Courses need approval before they are finalized.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              ) : courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((courseUpload) => (
                    <div key={courseUpload.id} className="flex items-center justify-between border-b pb-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {courseUpload.course.code} - {courseUpload.course.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {courseUpload.course.credits} credits • {courseUpload.course.department.name}
                        </p>
                      </div>
                      <Badge
                        className={
                          courseUpload.approvals && courseUpload.approvals.length > 0
                            ? courseUpload.approvals[0].status === "APPROVED"
                              ? "bg-green-500"
                              : courseUpload.approvals[0].status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            : "bg-yellow-500"
                        }
                      >
                        {courseUpload.approvals && courseUpload.approvals.length > 0
                          ? courseUpload.approvals[0].status === "APPROVED"
                            ? "Approved"
                            : courseUpload.approvals[0].status === "REJECTED"
                              ? "Rejected"
                              : "Pending"
                          : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No courses registered for the current semester.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/course-registration">Register for Courses</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Stay updated with the latest university announcements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>BU</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">Academic Office</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                    <p className="text-sm">
                      Registration for the next semester will begin on June 15th. Please ensure all outstanding fees are
                      cleared before registration.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>BU</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">Library</p>
                      <p className="text-xs text-muted-foreground">5 days ago</p>
                    </div>
                    <p className="text-sm">
                      The library will be closed for renovations from May 20th to May 25th. Online resources will remain
                      accessible.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                View All Announcements
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Calendar</CardTitle>
              <CardDescription>Important dates and events for the current semester.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Mid-Semester Exams</p>
                    <p className="text-xs text-muted-foreground">June 5th - June 10th, 2023</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Course Registration</p>
                    <p className="text-xs text-muted-foreground">June 15th - June 30th, 2023</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Final Exams</p>
                    <p className="text-xs text-muted-foreground">August 1st - August 15th, 2023</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Calendar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
