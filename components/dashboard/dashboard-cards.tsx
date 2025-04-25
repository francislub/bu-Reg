import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react"

interface DashboardCardsProps {
  user: any
}

export function DashboardCards({ user }: DashboardCardsProps) {
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-primary/20 shadow-md transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{currentSemester?.name || "Not Registered"}</div>
          <p className="text-xs text-muted-foreground">
            {currentSemester
              ? `${new Date(currentSemester.startDate).toLocaleDateString()} - ${new Date(
                  currentSemester.endDate,
                ).toLocaleDateString()}`
              : "Please register for a semester"}
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <Link href="/dashboard/semester-registration" className="text-xs text-primary hover:underline">
            View Registration Status
          </Link>
        </CardFooter>
      </Card>

      <Card className="border-success/20 shadow-md transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-success/5 to-success/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registered Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {approvedCourses.length} / {registeredCourses.length}
          </div>
          <p className="text-xs text-muted-foreground">
            {approvedCourses.length === registeredCourses.length
              ? "All courses approved"
              : `${registeredCourses.length - approvedCourses.length} pending approval`}
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <Link href="/dashboard/courses" className="text-xs text-success hover:underline">
            View Courses
          </Link>
        </CardFooter>
      </Card>

      <Card className="border-warning/20 shadow-md transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-warning/5 to-warning/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{attendancePercentage}%</div>
          <p className="text-xs text-muted-foreground">
            {totalSessions > 0
              ? `Present in ${presentSessions} out of ${totalSessions} sessions`
              : "No attendance records yet"}
          </p>
        </CardContent>
        <CardFooter className="p-2">
          <Link href="/dashboard/attendance" className="text-xs text-warning hover:underline">
            View Attendance
          </Link>
        </CardFooter>
      </Card>

      <Card className="border-destructive/20 shadow-md transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] bg-gradient-to-br from-destructive/5 to-destructive/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Academic Status</CardTitle>
          <GraduationCap className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">Good Standing</div>
          <p className="text-xs text-muted-foreground">Current GPA: Not Available</p>
        </CardContent>
        <CardFooter className="p-2">
          <Link href="/dashboard/profile" className="text-xs text-destructive hover:underline">
            View Academic Record
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
