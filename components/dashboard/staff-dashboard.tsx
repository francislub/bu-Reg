"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, CheckSquare, ClipboardList } from 'lucide-react'
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { StaffPerformanceChart } from "@/components/dashboard/staff-performance-chart"

interface StaffDashboardProps {
  user: any
  announcements: any[]
  events: any[]
  staffData: any
}

export function StaffDashboard({ user, announcements, events, staffData }: StaffDashboardProps) {
  const { coursesCount = 0, studentsCount = 0, sessionsCount = 0 } = staffData

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-green-600">{coursesCount}</div>
            <p className="text-xs text-muted-foreground">Courses you are teaching this semester</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/courses" className="text-xs text-green-600 hover:underline">
              View Courses
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-blue-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-blue-600">{studentsCount}</div>
            <p className="text-xs text-muted-foreground">Students enrolled in your courses</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/students" className="text-xs text-blue-600 hover:underline">
              View Students
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-amber-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Attendance Sessions</CardTitle>
            <CheckSquare className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-amber-600">{sessionsCount}</div>
            <p className="text-xs text-muted-foreground">Total attendance sessions recorded</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/attendance" className="text-xs text-amber-600 hover:underline">
              Manage Attendance
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-purple-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <ClipboardList className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-muted-foreground">Course registrations awaiting approval</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/approvals" className="text-xs text-purple-600 hover:underline">
              View Approvals
            </Link>
          </CardFooter>
        </Card>
      </div>

      <StaffPerformanceChart userId={user.id} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnnouncements announcements={announcements} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}
