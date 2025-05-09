import type { User } from "next-auth"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { CalendarIcon, BookOpenIcon, ClipboardCheckIcon, AlertCircleIcon, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StudentDashboardProps {
  user: User
  announcements: any[]
  events: any[]
  courses: any[]
  pendingApprovals: any[]
  attendanceRecords: any[]
  attendancePercentage: number
  programInfo?: {
    name: string
    department: string
  }
}

export function StudentDashboard({
  user,
  announcements,
  events,
  courses,
  pendingApprovals,
  attendanceRecords,
  attendancePercentage,
  programInfo,
}: StudentDashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Welcome back, {user.name}!</CardTitle>
          <CardDescription>Here's what's happening with your courses today.</CardDescription>
        </CardHeader>
        {programInfo && (
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Program: <Badge variant="outline">{programInfo.name}</Badge>
              </span>
              <span className="text-sm text-muted-foreground">
                Department: <Badge variant="outline">{programInfo.department}</Badge>
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
          <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courses.length}</div>
          <p className="text-xs text-muted-foreground">{courses.length === 1 ? "Course" : "Courses"} this semester</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              attendancePercentage >= 75
                ? "text-emerald-500"
                : attendancePercentage >= 60
                  ? "text-amber-500"
                  : "text-rose-500"
            }`}
          >
            {attendancePercentage}%
          </div>
          <Progress value={attendancePercentage} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <ClipboardCheckIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingApprovals.length}</div>
          <p className="text-xs text-muted-foreground">
            {pendingApprovals.length === 0
              ? "No pending course approvals"
              : `${pendingApprovals.length} course${pendingApprovals.length === 1 ? "" : "s"} awaiting approval`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Attendance</CardTitle>
          <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceRecords.length > 0 ? attendanceRecords[0].status : "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {attendanceRecords.length > 0
              ? `Last recorded for ${attendanceRecords[0].session.course.title}`
              : "No attendance records"}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Stay updated with the latest university announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentAnnouncements announcements={announcements} />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Don't miss these important dates</CardDescription>
        </CardHeader>
        <CardContent>
          <UpcomingEvents events={events} />
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Courses you are currently enrolled in</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/courses">View All Courses</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((registration) => (
                <Card key={registration.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1 text-base">{registration.course.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{registration.course.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">{registration.course.credits} Credits</p>
                    <Badge className="mt-2" variant={registration.status === "APPROVED" ? "default" : "outline"}>
                      {registration.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</div>
                <Button asChild size="sm">
                  <Link href="/dashboard/registration">Register for Courses</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
