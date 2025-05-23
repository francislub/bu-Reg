"use client"

import React, { useState, useEffect } from "react"
import { Users, UserCog, Building2, BookOpen, ClipboardCheck, FileBarChart2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface AdminDashboardProps {
  user: any
  announcements: any[]
  events?: any[]
  stats?: {
    students: number
    staff: number
    departments: number
    courses: number
    pendingApprovals: number
    registrations: number
  }
  trends?: {
    students: number
    staff: number
    departments: number
    courses: number
    pendingApprovals: number
    registrations: number
  }
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  announcements,
  events: initialEvents,
  stats,
  trends,
}) => {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>(initialEvents || [])
  const [adminData, setAdminData] = useState({
    studentsCount: stats?.students || 0,
    staffCount: stats?.staff || 0,
    departmentsCount: stats?.departments || 0,
    coursesCount: stats?.courses || 0,
    pendingApprovalsCount: stats?.pendingApprovals || 0,
    registrationsCount: stats?.registrations || 0,
    departmentStats: [],
    systemStats: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      uptime: 0,
    },
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // If we already have stats from the server, we don't need to fetch counts
        if (!stats) {
          // Fetch counts from various endpoints
          const [studentsRes, staffRes, coursesRes, approvalsRes, registrationsRes] = await Promise.all([
            fetch("/api/students?count=true"),
            fetch("/api/staff?count=true"),
            fetch("/api/courses?count=true"),
            fetch("/api/approvals?count=true"),
            fetch("/api/registrations?count=true"),
          ])

          const [studentsData, staffData, coursesData, approvalsData, registrationsData] = await Promise.all([
            studentsRes.json(),
            staffRes.json(),
            coursesRes.json(),
            approvalsRes.json(),
            registrationsRes.json(),
          ])

          setAdminData((prev) => ({
            ...prev,
            studentsCount: studentsData.count || 0,
            staffCount: staffData.count || 0,
            coursesCount: coursesData.count || 0,
            pendingApprovalsCount: approvalsData.count || 0,
            registrationsCount: registrationsData.count || 0,
          }))
        }

        // Always fetch system stats and department stats
        const [systemStatsResponse, departmentsResponse] = await Promise.all([
          fetch("/api/analytics/system-stats"),
          fetch("/api/analytics/departments"),
        ])

        const [systemStatsData, departmentsData] = await Promise.all([
          systemStatsResponse.json(),
          departmentsResponse.json(),
        ])

        setAdminData((prev) => ({
          ...prev,
          departmentStats: departmentsData.departments || [],
          systemStats: systemStatsData.stats || {
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            uptime: 0,
          },
        }))

        // Fetch events if not provided
        if (!initialEvents) {
          const eventsRes = await fetch("/api/events")
          const eventsData = await eventsRes.json()
          if (eventsData.success) {
            setEvents(eventsData.events)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [initialEvents, stats])

  const cardConfig = [
    {
      title: "Students",
      value: adminData.studentsCount,
      icon: Users,
      color: "from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30",
      iconColor: "text-blue-600 bg-blue-100",
      trend: `${trends?.students >= 0 ? "+" : ""}${trends?.students || 0}%`,
      link: "/dashboard/students",
    },
    {
      title: "Staff",
      value: adminData.staffCount,
      icon: UserCog,
      color: "from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30",
      iconColor: "text-purple-600 bg-purple-100",
      trend: `${trends?.staff >= 0 ? "+" : ""}${trends?.staff || 0}%`,
      link: "/dashboard/staff",
    },
    {
      title: "Departments",
      value: adminData.departmentsCount,
      icon: Building2,
      color: "from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30",
      iconColor: "text-emerald-600 bg-emerald-100",
      trend: `${trends?.departments >= 0 ? "+" : ""}${trends?.departments || 0}%`,
      link: "/dashboard/departments",
    },
    {
      title: "Courses",
      value: adminData.coursesCount,
      icon: BookOpen,
      color: "from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30",
      iconColor: "text-amber-600 bg-amber-100",
      trend: `${trends?.courses >= 0 ? "+" : ""}${trends?.courses || 0}%`,
      link: "/dashboard/courses",
    },
    {
      title: "Pending Approvals",
      value: adminData.pendingApprovalsCount,
      icon: ClipboardCheck,
      color: "from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30",
      iconColor: "text-rose-600 bg-rose-100",
      trend: `${trends?.pendingApprovals >= 0 ? "+" : ""}${trends?.pendingApprovals || 0}%`,
      link: "/dashboard/approvals",
    },
    {
      title: "Registrations",
      value: adminData.registrationsCount,
      icon: FileBarChart2,
      color: "from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30",
      iconColor: "text-cyan-600 bg-cyan-100",
      trend: `${trends?.registrations >= 0 ? "+" : ""}${trends?.registrations || 0}%`,
      link: "/dashboard/registration-reports",
    },
  ]

  const departmentLabels = adminData.departmentStats.map((dept: any) => dept.name)
  const studentCounts = adminData.departmentStats.map((dept: any) => dept.studentCount)

  const chartData = {
    labels: departmentLabels,
    datasets: [
      {
        label: "Students per Department",
        data: studentCounts,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderWidth: 1,
        borderColor: "rgba(54, 162, 235, 1)",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Student Distribution by Department",
      },
    },
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {cardConfig.map((card, index) => (
          <Card
            key={index}
            className={`p-4 shadow-md border-none transition-colors dark:bg-neutral-950 dark:ring-offset-neutral-950 ${card.color}`}
          >
            <a href={card.link}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{card.title}</div>
                  {loading ? (
                    <Skeleton className="h-4 w-16 mt-2" />
                  ) : (
                    <div className="text-2xl font-bold mt-2">{card.value}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {card.trend && (
                      <>
                        <span className={card.trend.startsWith("+") ? "text-green-500" : "text-red-500"}>
                          {card.trend}
                        </span>
                        <span> vs last week</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`rounded-full p-3 ${card.iconColor}`}>
                  {React.createElement(card.icon, { className: "h-6 w-6" })}
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Statistics */}
        <Card className="shadow-md border-none transition-colors dark:bg-neutral-950 dark:ring-offset-neutral-950">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
            {loading ? (
              <>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span>CPU Usage:</span>
                  <span>{adminData.systemStats.cpuUsage}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Memory Usage:</span>
                  <span>{adminData.systemStats.memoryUsage}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Disk Usage:</span>
                  <span>{adminData.systemStats.diskUsage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Uptime:</span>
                  <span>{adminData.systemStats.uptime} hours</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Department Statistics Chart */}
        <Card className="shadow-md border-none transition-colors dark:bg-neutral-950 dark:ring-offset-neutral-950">
          <div className="p-4">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </Card>
      </div>

      {/* Recent Announcements */}
      <Card className="mt-4 shadow-md border-none transition-colors dark:bg-neutral-950 dark:ring-offset-neutral-950">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {announcements.map((announcement: any) => (
                <div key={announcement.id} className="flex items-start space-x-2">
                  <Badge variant="secondary">New</Badge>
                  <div>
                    <p className="text-sm font-medium leading-none">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="mt-4 shadow-md border-none transition-colors dark:bg-neutral-950 dark:ring-offset-neutral-950">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {events.map((event: any) => (
                <div key={event.id} className="flex items-start space-x-2">
                  <Badge variant="outline">{new Date(event.date).toLocaleDateString()}</Badge>
                  <div>
                    <p className="text-sm font-medium leading-none">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard
