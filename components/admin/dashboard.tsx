"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export function AdminDashboard() {
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
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard statistics
        const statsRes = await fetch("/api/dashboard/stats")
        const statsData = await statsRes.json()
        setStats(statsData)

        // Fetch registration trends
        const trendsRes = await fetch("/api/dashboard/registration-trends")
        const trendsData = await trendsRes.json()
        setRegistrationData(trendsData)

        // Fetch department distribution
        const deptRes = await fetch("/api/dashboard/department-distribution")
        const deptData = await deptRes.json()
        setDepartmentData(deptData)

        // Fetch pending registrations
        const pendingRes = await fetch("/api/registrations?status=PENDING&limit=5")
        const pendingData = await pendingRes.json()
        setPendingRegistrations(pendingData.registrations)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleApprove = async (id) => {
    try {
      await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      // Update the pending registrations list
      setPendingRegistrations(pendingRegistrations.filter((reg) => reg.id !== id))

      // Update the stats
      setStats((prev) => ({
        ...prev,
        pendingRegistrations: prev.pendingRegistrations - 1,
      }))
    } catch (error) {
      console.error("Error approving registration:", error)
    }
  }

  const handleReject = async (id) => {
    try {
      await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      })

      // Update the pending registrations list
      setPendingRegistrations(pendingRegistrations.filter((reg) => reg.id !== id))

      // Update the stats
      setStats((prev) => ({
        ...prev,
        pendingRegistrations: prev.pendingRegistrations - 1,
      }))
    } catch (error) {
      console.error("Error rejecting registration:", error)
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-users"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
            </div>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-briefcase"
                >
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
            </div>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-clipboard-list"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              </div>
            </div>
            {stats.pendingRegistrations > 0 && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-alert-triangle mr-1"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <span>Requires attention</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Registrations</CardTitle>
            <CardDescription>Monthly registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationData.length > 0 ? (
              <ChartContainer className="h-[300px]">
                <Chart>
                  <LineChart data={registrationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </Chart>
              </ChartContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-md">
                <p className="text-gray-500">No registration data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ChartContainer className="h-[300px]">
                <Chart>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </Chart>
              </ChartContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-md">
                <p className="text-gray-500">No department data available</p>
              </div>
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
                      <td className="py-3 px-4">{registration.student.registrationNo}</td>
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

