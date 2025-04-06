"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, ClipboardList, Users, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function FacultyDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingApprovals: 0,
  })
  const [courses, setCourses] = useState([])
  const [recentRegistrations, setRecentRegistrations] = useState([])
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

      // Fetch recent registrations
      const registrationsRes = await fetch(
        `/api/faculty/registrations?facultyId=${session.user.id}&status=PENDING&limit=5`,
      )
      const registrationsData = await registrationsRes.json()
      setRecentRegistrations(registrationsData.registrations)

      // Calculate stats
      setStats({
        totalCourses: coursesData.courses.length,
        totalStudents: calculateTotalStudents(coursesData.courses),
        pendingApprovals: registrationsData.registrations.filter((reg) => reg.status === "PENDING").length,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalStudents = (courses) => {
    // Count unique students across all courses
    const studentIds = new Set()

    courses.forEach((course) => {
      if (course.registrations) {
        course.registrations.forEach((reg) => {
          if (reg.status === "APPROVED") {
            studentIds.add(reg.studentId)
          }
        })
      }
    })

    return studentIds.size
  }

  const handleApprove = async (registrationId) => {
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      if (!res.ok) {
        throw new Error("Failed to approve registration")
      }

      toast({
        title: "Success",
        description: "Registration approved successfully",
      })

      // Update local state
      setRecentRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId))

      // Update pending approvals count
      setStats((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
      }))
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to approve registration",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (registrationId) => {
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      })

      if (!res.ok) {
        throw new Error("Failed to reject registration")
      }

      toast({
        title: "Success",
        description: "Registration rejected successfully",
      })

      // Update local state
      setRecentRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId))

      // Update pending approvals count
      setStats((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
      }))
    } catch (error) {
      console.error("Error rejecting registration:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reject registration",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Courses</p>
              <p className="text-3xl font-bold">{loading ? "..." : stats.totalCourses}</p>
            </div>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Students</p>
              <p className="text-3xl font-bold">{loading ? "..." : stats.totalStudents}</p>
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
              <p className="text-3xl font-bold">{loading ? "..." : stats.pendingApprovals}</p>
            </div>
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full">
              <ClipboardList className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Courses you are currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading courses...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        {course.code}: {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.semester} • {course.credits} credits
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {course.currentEnrolled}/{course.maxCapacity} students
                      </div>
                      <Link href={`/faculty/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You are not teaching any courses yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Recent registration requests that need your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading registration requests...</p>
              </div>
            ) : recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{registration.student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {registration.course.code}: {registration.course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested on {new Date(registration.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                        onClick={() => handleApprove(registration.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                        onClick={() => handleReject(registration.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}

                {stats.pendingApprovals > recentRegistrations.length && (
                  <div className="text-center mt-4">
                    <Link href="/faculty/approvals">
                      <Button variant="link">View all {stats.pendingApprovals} pending approvals</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending registration requests.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

