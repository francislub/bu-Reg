"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, CheckSquare, ClipboardList } from "lucide-react"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { StaffPerformanceChart } from "@/components/dashboard/staff-performance-chart"

interface StaffDashboardProps {
  user: any
  announcements: any[]
  events: any[]
  staffData?: {
    coursesCount: number
    studentCount: number
    attendanceSessionsCount: number
    performanceData: any[]
  }
}

export function StaffDashboard({ user, announcements, events, staffData }: StaffDashboardProps) {
  const { coursesCount = 0, studentsCount = 0, sessionsCount = 0 } = staffData || {}

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-2xl font-bold text-primary">{coursesCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Courses you are teaching this semester</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/courses" className="text-xs hover:underline">
              View Courses
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-2xl font-bold text-primary">{studentsCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Students enrolled in your courses</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/students" className="text-xs hover:underline">
              View Students
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Sessions</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-2xl font-bold text-primary">{sessionsCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total attendance sessions recorded</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/attendance" className="text-xs hover:underline">
              Manage Attendance
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Course registrations awaiting approval</p>
          </CardContent>
          <CardFooter className="p-2">
            <Link href="/dashboard/approvals" className="text-xs hover:underline">
              View Approvals
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
        <StaffPerformanceChart userId={user.id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnnouncements announcements={announcements} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}
