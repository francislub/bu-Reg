"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, User, Building, BookOpen, ClipboardList, BarChart } from "lucide-react"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { AdminStatsChart } from "@/components/dashboard/admin-stats-chart"

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground">Total registered students</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/students" className="text-xs hover:underline">
              Manage Students
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCount}</div>
            <p className="text-xs text-muted-foreground">Total university staff</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/staff" className="text-xs hover:underline">
              Manage Staff
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentsCount}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/departments" className="text-xs hover:underline">
              Manage Departments
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount}</div>
            <p className="text-xs text-muted-foreground">Total courses offered</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/courses" className="text-xs hover:underline">
              Manage Courses
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovalsCount}</div>
            <p className="text-xs text-muted-foreground">Course registrations awaiting approval</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/approvals" className="text-xs hover:underline">
              View Approvals
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Available system reports</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/reports" className="text-xs hover:underline">
              View Reports
            </Link>
          </CardFooter>
        </Card>
      </div>

      <AdminStatsChart />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnnouncements announcements={announcements} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}
