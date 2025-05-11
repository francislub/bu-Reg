"use client"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { AdminStatsChart } from "@/components/dashboard/admin-stats-chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Printer } from "lucide-react"

interface AdminDashboardProps {
  user: any
  announcements: any[]
  events: any[]
  adminData: {
    studentsCount: number
    staffCount: number
    departmentsCount: number
    coursesCount: number
    pendingApprovalsCount: number
    departmentStats?: any[]
  }
}

export function AdminDashboard({ user, announcements, events, adminData }: AdminDashboardProps) {
  // Ensure adminData is defined with default values
  const {
    studentsCount = 0,
    staffCount = 0,
    departmentsCount = 0,
    coursesCount = 0,
    pendingApprovalsCount = 0,
  } = adminData || { studentsCount: 0, staffCount: 0, departmentsCount: 0, coursesCount: 0, pendingApprovalsCount: 0 }

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/registration-reports">
            <Printer className="mr-2 h-4 w-4" />
            Registration Reports
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Students</h3>
          <p className="text-3xl font-bold text-primary">{studentsCount}</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Staff</h3>
          <p className="text-3xl font-bold text-primary">{staffCount}</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Departments</h3>
          <p className="text-3xl font-bold text-primary">{departmentsCount}</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Courses</h3>
          <p className="text-3xl font-bold text-primary">{coursesCount}</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary">{pendingApprovalsCount}</p>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Reports</h3>
          <p className="text-3xl font-bold text-primary">5</p>
        </div>
      </div>

      <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
        <AdminStatsChart />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnnouncements announcements={announcements} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}
