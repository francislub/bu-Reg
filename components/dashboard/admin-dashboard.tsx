"use client"

import { useState, useEffect } from "react"
import { Users, UserCog, Building2, BookOpen, ClipboardCheck, FileBarChart2, ArrowUpRight, Printer } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { AdminStatsChart } from "@/components/dashboard/admin-stats-chart"
import Link from "next/link"

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

export function AdminDashboard({ user, announcements, events: initialEvents, stats, trends }: AdminDashboardProps) {
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
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState(initialEvents || [])

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

  // Card colors and icons configuration
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Administrator"}</p>
        </div>
        <Button asChild variant="outline" className="shadow-sm">
          <Link href="/dashboard/registration-reports">
            <Printer className="mr-2 h-4 w-4" />
            Registration Reports
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? // Loading skeletons
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-12" />
                  </CardContent>
                </Card>
              ))
          : // Actual data cards
            cardConfig.map((card, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-md">
                <div className={`bg-gradient-to-br ${card.color} transition-all duration-300 h-full`}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div className={`p-2 rounded-full ${card.iconColor}`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                    <div className="flex items-center text-xs mt-1">
                      <span
                        className={`flex items-center ${card.trend.startsWith("+") ? "text-emerald-600" : card.trend === "0%" ? "text-gray-500" : "text-rose-600"}`}
                      >
                        {card.trend.startsWith("+") && <ArrowUpRight className="h-3 w-3 mr-1" />}
                        {card.trend}
                      </span>
                      <span className="text-muted-foreground ml-1">from last month</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2">
                    <Link href={card.link} className="text-xs hover:underline">
                      View Details
                    </Link>
                  </CardFooter>
                </div>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-md border-none overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50">
            <CardHeader className="border-b bg-white/50 dark:bg-black/10">
              <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                University Statistics
              </CardTitle>
              <CardDescription>Overview of university enrollment and performance</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? <Skeleton className="h-[300px] w-full" /> : <AdminStatsChart />}
            </CardContent>
          </div>
        </Card>

        <Card className="shadow-md border-none overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 h-full">
            <CardHeader className="border-b bg-white/50 dark:bg-black/10">
              <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                System Health
              </CardTitle>
              <CardDescription>Current system performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-2 w-full" />
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="font-medium">{adminData.systemStats.cpuUsage}%</span>
                    </div>
                    <Progress
                      value={adminData.systemStats.cpuUsage}
                      className="h-2"
                      indicatorClassName={
                        adminData.systemStats.cpuUsage > 80
                          ? "bg-red-500"
                          : adminData.systemStats.cpuUsage > 60
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="font-medium">{adminData.systemStats.memoryUsage}%</span>
                    </div>
                    <Progress
                      value={adminData.systemStats.memoryUsage}
                      className="h-2"
                      indicatorClassName={
                        adminData.systemStats.memoryUsage > 80
                          ? "bg-red-500"
                          : adminData.systemStats.memoryUsage > 60
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Disk Usage</span>
                      <span className="font-medium">{adminData.systemStats.diskUsage}%</span>
                    </div>
                    <Progress
                      value={adminData.systemStats.diskUsage}
                      className="h-2"
                      indicatorClassName={
                        adminData.systemStats.diskUsage > 80
                          ? "bg-red-500"
                          : adminData.systemStats.diskUsage > 60
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }
                    />
                  </div>

                  <div className="pt-2 text-sm text-center text-muted-foreground">
                    System uptime: {Math.floor(adminData.systemStats.uptime / 24)} days,{" "}
                    {adminData.systemStats.uptime % 24} hours
                  </div>
                </>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnnouncements announcements={announcements} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}
