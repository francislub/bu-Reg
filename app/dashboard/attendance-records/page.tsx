import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Clock, X } from "lucide-react"
import { format } from "date-fns"

export default async function AttendanceRecordsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Get active semester
  const activeSemester = await db.semester.findFirst({
    where: { isActive: true },
  })

  if (!activeSemester) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Attendance Records" text="View your attendance records for all courses." />
        <Card className="border-warning/20">
          <CardHeader className="bg-warning/5">
            <CardTitle className="text-warning flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              No Active Semester
            </CardTitle>
            <CardDescription>There is no active semester at the moment. Please check back later.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    )
  }

  // Get user's attendance records for the active semester
  const attendanceRecords = await db.attendanceRecord.findMany({
    where: {
      studentId: session.user.id,
      session: {
        semesterId: activeSemester.id,
      },
    },
    include: {
      session: {
        include: {
          course: true,
        },
      },
    },
    orderBy: {
      session: {
        date: "desc",
      },
    },
  })

  // Group attendance records by course
  const recordsByCourse = attendanceRecords.reduce(
    (acc, record) => {
      const courseId = record.session.courseId
      if (!acc[courseId]) {
        acc[courseId] = {
          course: record.session.course,
          records: [],
          stats: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
          },
        }
      }

      acc[courseId].records.push(record)
      acc[courseId].stats.total++

      if (record.status === "PRESENT") acc[courseId].stats.present++
      else if (record.status === "ABSENT") acc[courseId].stats.absent++
      else if (record.status === "LATE") acc[courseId].stats.late++

      return acc
    },
    {} as Record<string, any>,
  )

  return (
    <DashboardShell>
      <DashboardHeader heading="Attendance Records" text="View your attendance records for all courses." />

      {Object.keys(recordsByCourse).length > 0 ? (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Records</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(recordsByCourse).map((courseData: any) => {
                const { course, stats } = courseData
                const attendancePercentage = Math.round((stats.present / stats.total) * 100)

                return (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {course.code}: {course.title}
                      </CardTitle>
                      <CardDescription>{stats.total} Sessions Recorded</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Attendance Rate:</span>
                          <span
                            className={`font-medium ${
                              attendancePercentage >= 75
                                ? "text-success"
                                : attendancePercentage >= 60
                                  ? "text-warning"
                                  : "text-destructive"
                            }`}
                          >
                            {attendancePercentage}%
                          </span>
                        </div>

                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              attendancePercentage >= 75
                                ? "bg-success"
                                : attendancePercentage >= 60
                                  ? "bg-warning"
                                  : "bg-destructive"
                            }`}
                            style={{ width: `${attendancePercentage}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="text-center p-1 bg-success/10 rounded">
                            <div className="text-success font-medium">{stats.present}</div>
                            <div className="text-xs">Present</div>
                          </div>
                          <div className="text-center p-1 bg-warning/10 rounded">
                            <div className="text-warning font-medium">{stats.late}</div>
                            <div className="text-xs">Late</div>
                          </div>
                          <div className="text-center p-1 bg-destructive/10 rounded">
                            <div className="text-destructive font-medium">{stats.absent}</div>
                            <div className="text-xs">Absent</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          <TabsContent value="detailed" className="space-y-6">
            {Object.values(recordsByCourse).map((courseData: any) => {
              const { course, records } = courseData

              return (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>
                      {course.code}: {course.title}
                    </CardTitle>
                    <CardDescription>{records.length} attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {records.map((record: any) => (
                            <tr key={record.id}>
                              <td className="px-4 py-2 text-sm">
                                {format(new Date(record.session.date), "MMM dd, yyyy")}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {record.session.startTime} - {record.session.endTime}
                              </td>
                              <td className="px-4 py-2">
                                <Badge
                                  variant={
                                    record.status === "PRESENT"
                                      ? "success"
                                      : record.status === "ABSENT"
                                        ? "destructive"
                                        : "warning"
                                  }
                                >
                                  {record.status === "PRESENT" && <Check className="mr-1 h-3 w-3" />}
                                  {record.status === "ABSENT" && <X className="mr-1 h-3 w-3" />}
                                  {record.status === "LATE" && <Clock className="mr-1 h-3 w-3" />}
                                  {record.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 text-sm text-muted-foreground">{record.comments || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-warning/20">
          <CardHeader className="bg-warning/5">
            <CardTitle className="text-warning flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              No Attendance Records
            </CardTitle>
            <CardDescription>There are no attendance records for you in the current semester.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </DashboardShell>
  )
}
