"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, GraduationCap } from 'lucide-react'
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

interface StudentDashboardProps {
  user: any
  announcements: any[]
  events: any[]
}

export function StudentDashboard({ user, announcements, events }: StudentDashboardProps) {
  // Calculate attendance percentage
  const attendanceRecords = user?.attendanceRecords || []
  const totalSessions = attendanceRecords.length
  const presentSessions = attendanceRecords.filter((record: any) => record.status === "PRESENT").length
  const attendancePercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0

  // Get current semester
  const currentSemester = user?.registrations?.[0]?.semester

  // Get registered courses
  const registeredCourses = user?.registrations?.[0]?.courseUploads || []
  const approvedCourses = registeredCourses.filter((upload: any) => upload.status === "APPROVED")

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-blue-600">{currentSemester?.name || "Not Registered"}</div>
            <p className="text-xs text-muted-foreground">
              {currentSemester
                ? `${new Date(currentSemester.startDate).toLocaleDateString()} - ${new Date(
                    currentSemester.endDate,
                  ).toLocaleDateString()}`
                : "Please register for a semester"}
            </p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/registration" className="text-xs text-blue-600 hover:underline">
              View Registration Status
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-green-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Registered Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-green-600">
              {approvedCourses.length} / {registeredCourses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedCourses.length === registeredCourses.length
                ? "All courses approved"
                : `${registeredCourses.length - approvedCourses.length} pending approval`}
            </p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/courses" className="text-xs text-green-600 hover:underline">
              View Courses
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-amber-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-amber-600">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {totalSessions > 0
                ? `Present in ${presentSessions} out of ${totalSessions} sessions`
                : "No attendance records yet"}
            </p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/attendance" className="text-xs text-amber-600 hover:underline">
              View Attendance
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-red-200 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 opacity-50 rounded-lg" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Academic Status</CardTitle>
            <GraduationCap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-red-600">Good Standing</div>
            <p className="text-xs text-muted-foreground">Current GPA: Not Available</p>
          </CardContent>
          <CardFooter className="p-2 relative">
            <Link href="/dashboard/profile" className="text-xs text-red-600 hover:underline">
              View Academic Record
            </Link>
          </CardFooter>
        </Card>
      </div>

      <DashboardCharts userId={user.id} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentAnnouncements announcements={announcements} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}
