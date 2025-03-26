"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Briefcase,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    facultyMembers: 0,
    pendingRegistrations: 0,
  })
  const [registrationData, setRegistrationData] = useState([])
  const [departmentData, setDepartmentData] = useState([])
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch dashboard stats
      const statsRes = await fetch("/api/dashboard/stats")
      const statsData = await statsRes.json()
      setStats(statsData)

      // Fetch pending registrations
      const registrationsRes = await fetch("/api/registrations?status=PENDING&limit=3")
      const registrationsData = await registrationsRes.json()
      setPendingRegistrations(registrationsData.registrations)

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
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
      setPendingRegistrations(pendingRegistrations.filter((reg) => reg.id !== id))
      setStats((prev) => ({
        ...prev,
        pendingRegistrations: prev.pendingRegistrations - 1,
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

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
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
      setPendingRegistrations(pendingRegistrations.filter((reg) => reg.id !== id))
      setStats((prev) => ({
        ...prev,
        pendingRegistrations: prev.pendingRegistrations - 1,
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <div className="p-2 bg-green-100 text-green-800 rounded-full">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Manage student enrollments</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.activeCourses.toLocaleString()}</div>
              <div className="p-2 bg-blue-100 text-blue-800 rounded-full">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Across all departments</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.facultyMembers.toLocaleString()}</div>
              <div className="p-2 bg-purple-100 text-purple-800 rounded-full">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Teaching staff</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.pendingRegistrations.toLocaleString()}</div>
              <div className="p-2 bg-yellow-100 text-yellow-800 rounded-full">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            {stats.pendingRegistrations > 0 && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Requires attention</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registration Requests</CardTitle>
          <CardDescription>Pending approvals from students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {pendingRegistrations.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegistrations.map((registration) => (
                    <tr key={registration.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{registration.student.registrationNo || "N/A"}</td>
                      <td className="py-3 px-4">{registration.student.name}</td>
                      <td className="py-3 px-4">
                        {registration.course.code}: {registration.course.title}
                      </td>
                      <td className="py-3 px-4">{new Date(registration.registeredAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-500">No pending registration requests</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

