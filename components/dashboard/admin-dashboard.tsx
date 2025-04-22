"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, User, Building, BookOpen, ClipboardList, BarChart } from 'lucide-react'
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { AdminStatsChart } from "@/components/dashboard/admin-stats-chart"

interface AdminDashboardProps {
  user: any
  announcements: any[]
  events: any[]
  adminData: any
}

export function AdminDashboard({ user, announcements, events, adminData }: AdminDashboardProps) {
  const { 
    studentsCount = 0, 
    staffCount = 0, 
    departmentsCount = 0, 
    coursesCount = 0, 
    pendingApprovalsCount = 0 
  } = adminData

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-purple-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-purple-600">{studentsCount}</div>
            <p className="text-xs text-muted-foreground">Total registered students</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/students" className="text-xs text-purple-600 hover:underline">
              Manage Students
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-indigo-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-indigo-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <User className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-indigo-600">{staffCount}</div>
            <p className="text-xs text-muted-foreground">Total university staff</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/staff" className="text-xs text-indigo-600 hover:underline">
              Manage Staff
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-pink-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-pink-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-pink-600">{departmentsCount}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/departments" className="text-xs text-pink-600 hover:underline">
              Manage Departments
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-cyan-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-cyan-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-cyan-600">{coursesCount}</div>
            <p className="text-xs text-muted-foreground">Total courses offered</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/courses" className="text-xs text-cyan-600 hover:underline">
              Manage Courses
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-amber-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-amber-600">{pendingApprovalsCount}</div>
            <p className="text-xs text-muted-foreground">Course registrations awaiting approval</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/approvals" className="text-xs text-amber-600 hover:underline">
              View Approvals
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-emerald-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-emerald-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <BarChart className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-emerald-600">5</div>
            <p className="text-xs text-muted-foreground">Available system reports</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/reports" className="text-xs text-emerald-600 hover:underline">
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
