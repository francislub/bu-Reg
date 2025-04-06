"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Calendar, CheckCircle, Clock, Users, XCircle } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  department: string
  semester: string
  academicYear: string
  enrolledStudents: number
  maxCapacity: number
}

interface PendingApproval {
  id: string
  studentName: string
  studentId: string
  courseCode: string
  courseTitle: string
  requestDate: string
}

export default function FacultyDashboardPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
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

      // Fetch faculty courses
      const coursesRes = await fetch(`/api/faculty/courses?facultyId=${session.user.id}`)
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses)

      // Fetch pending approvals
      const approvalsRes = await fetch(`/api/faculty/approvals?facultyId=${session.user.id}&status=PENDING`)
      const approvalsData = await approvalsRes.json()
      setPendingApprovals(approvalsData.approvals)

      // Set stats
      setStats({
        totalCourses: coursesData.courses.length,
        totalStudents: coursesData.courses.reduce((acc, course) => acc + course.enrolledStudents, 0),
        pendingApprovals: approvalsData.approvals.length,
        upcomingDeadlines: 2, // Placeholder
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

  const handleApprove = async (approvalId: string) => {
    try {
      const res = await fetch(`/api/registrations/${approvalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      if (!res.ok) {
        throw new Error("Failed to approve registration")
      }

      useToast({
        title: "Success",
        description: "Registration approved successfully",
      })

      // Update local state
      setPendingApprovals((prev) => prev.filter((approval) => approval.id !== approvalId))
      setStats((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
      }))
    } catch (error) {
      console.error("Error approving registration:", error)
      useToast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (approvalId: string) => {
    try {
      const res = await fetch(`/api/registrations/${approvalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      })

      if (!res.ok) {
        throw new Error("Failed to reject registration")
      }

      useToast({
        title: "Success",
        description: "Registration rejected successfully",
      })

      // Update local state
      setPendingApprovals((prev) => prev.filter((approval) => approval.id !== approvalId))
      setStats((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
      }))
    } catch (error) {
      console.error("Error rejecting registration:", error)
      useToast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive",
      })
    }
  }

  // Sample data for the chart
  const enrollmentData = [
    { name: "CS101", students: 45, capacity: 50 },
    { name: "CS201", students: 38, capacity: 40 },
    { name: "CS301", students: 25, capacity: 35 },
    { name: "CS401", students: 18, capacity: 30 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}. Here's an overview of your courses and student registrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
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
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <Users className="h-6 w-6" />
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
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="analytics">Enrollment Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Loading courses...</p>
            ) : courses.length > 0 ? (
              courses.map((course) => (
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
                        <span className="text-sm text-muted-foreground">Department:</span>
                        <span className="text-sm font-medium">{course.department}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Semester:</span>
                        <span className="text-sm font-medium">{course.semester}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Enrollment:</span>
                        <span className="text-sm font-medium">
                          {course.enrolledStudents}/{course.maxCapacity}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Link href={`/faculty/courses/${course.id}`}>
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
                <p className="text-muted-foreground text-center">You don't have any assigned courses yet.</p>
              </div>
            )}
          </div>

          {courses.length > 0 && (
            <div className="flex justify-end">
              <Link href="/faculty/courses">
                <Button variant="outline">View All Courses</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {loading ? (
            <p>Loading approvals...</p>
          ) : pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <Card key={approval.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{approval.studentName}</h3>
                        <p className="text-sm text-muted-foreground">Student ID: {approval.studentId}</p>
                        <p className="text-sm">
                          Course: {approval.courseCode} - {approval.courseTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested on: {new Date(approval.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                          onClick={() => handleApprove(approval.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                          onClick={() => handleReject(approval.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end">
                <Link href="/faculty/approvals">
                  <Button variant="outline">View All Approvals</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No pending approvals at the moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollment</CardTitle>
              <CardDescription>Current enrollment status for your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" name="Enrolled Students" fill="#4f46e5" />
                    <Bar dataKey="capacity" name="Maximum Capacity" fill="#e5e7eb" />
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

