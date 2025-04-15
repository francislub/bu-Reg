"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

type Course = {
  id: string
  code: string
  title: string
  department: {
    name: string
  }
}

type AttendanceRecord = {
  id: string
  sessionId: string
  studentId: string
  status: string
  comments?: string
  session: {
    id: string
    courseId: string
    date: string
    startTime: string
    endTime: string
    topic?: string
    course: Course
    lecturer: {
      id: string
      name: string
      profile?: {
        firstName: string
        lastName: string
      }
    }
  }
}

type AttendanceStats = {
  totalSessions: number
  present: number
  absent: number
  studentLate: number
  presentPercentage: number
  absentPercentage: number
  latePercentage: number
}

interface StudentAttendanceViewProps {
  userId: string
}

export function StudentAttendanceView({ userId }: StudentAttendanceViewProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch attendance records
        const recordsRes = await fetch(`/api/attendance/students/${userId}/records`)
        if (!recordsRes.ok) {
          throw new Error("Failed to fetch attendance records")
        }
        const recordsData = await recordsRes.json()
        setAttendanceRecords(recordsData)

        // Fetch attendance stats
        const statsRes = await fetch(`/api/attendance/students/${userId}/stats`)
        if (!statsRes.ok) {
          throw new Error("Failed to fetch attendance statistics")
        }
        const statsData = await statsRes.json()
        setAttendanceStats(statsData)

        // Extract unique courses from attendance records
        const uniqueCourses = Array.from(
          new Map(
            recordsData.map((record: AttendanceRecord) => [record.session.course.id, record.session.course]),
          ).values(),
        )
        setCourses(uniqueCourses)
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your attendance data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, toast])

  const filteredRecords = attendanceRecords.filter((record) => {
    if (selectedCourse === "all") {
      return true
    }
    return record.session.course.id === selectedCourse
  })

  // Group records by course
  const recordsByCourse = attendanceRecords.reduce(
    (acc, record) => {
      const courseId = record.session.course.id
      if (!acc[courseId]) {
        acc[courseId] = []
      }
      acc[courseId].push(record)
      return acc
    },
    {} as Record<string, AttendanceRecord[]>,
  )

  // Format date (ISO to readable format)
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }

  // Format time (24h to 12h format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Get badge color based on attendance status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "ABSENT":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case "LATE":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (attendanceRecords.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No attendance records</AlertTitle>
        <AlertDescription>
          There are no attendance records for you this semester. This could be because your lecturers have not yet
          recorded attendance or you have not attended any classes.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Detailed Records</TabsTrigger>
          <TabsTrigger value="courses">By Course</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Your attendance statistics for the current semester</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-600 text-xl font-bold">{attendanceStats.presentPercentage}%</div>
                      <div className="text-sm font-medium">Present</div>
                      <div className="text-sm text-muted-foreground">
                        {attendanceStats.present} of {attendanceStats.totalSessions} sessions
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-yellow-600 text-xl font-bold">{attendanceStats.latePercentage}%</div>
                      <div className="text-sm font-medium">Late</div>
                      <div className="text-sm text-muted-foreground">
                        {attendanceStats.studentLate} of {attendanceStats.totalSessions} sessions
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-red-600 text-xl font-bold">{attendanceStats.absentPercentage}%</div>
                      <div className="text-sm font-medium">Absent</div>
                      <div className="text-sm text-muted-foreground">
                        {attendanceStats.absent} of {attendanceStats.totalSessions} sessions
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Overall Attendance</h3>
                    <Progress value={attendanceStats.presentPercentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      You've attended {attendanceStats.presentPercentage}% of your classes this semester
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No statistics available</AlertTitle>
                  <AlertDescription>
                    We couldn't retrieve your attendance statistics. Please try again later.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Your most recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{record.session.course.code}</div>
                      <div className="text-sm text-muted-foreground">{record.session.course.title}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(record.session.date)}
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        {formatTime(record.session.startTime)}
                      </div>
                    </div>
                    <div>{getStatusBadge(record.status)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Detailed view of all your attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="courseFilter">Filter by Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger id="courseFilter" className="w-full sm:w-80">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No records found for the selected filter.</p>
                  </div>
                ) : (
                  filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{record.session.course.code}</div>
                          <div className="text-sm text-muted-foreground">{record.session.course.title}</div>
                        </div>
                        <div>{getStatusBadge(record.status)}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row text-sm text-muted-foreground gap-2 sm:gap-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(record.session.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(record.session.startTime)} - {formatTime(record.session.endTime)}
                        </div>
                      </div>
                      {record.session.topic && (
                        <div className="text-sm">
                          <span className="font-medium">Topic:</span> {record.session.topic}
                        </div>
                      )}
                      {record.comments && (
                        <div className="text-sm">
                          <span className="font-medium">Comments:</span> {record.comments}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-6">
            {Object.keys(recordsByCourse).length === 0 ? (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>No course records</AlertTitle>
                <AlertDescription>There are no attendance records available by course.</AlertDescription>
              </Alert>
            ) : (
              Object.entries(recordsByCourse).map(([courseId, records]) => {
                const course = records[0].session.course
                const totalSessions = records.length
                const present = records.filter((r) => r.status === "PRESENT").length
                const late = records.filter((r) => r.status === "LATE").length
                const absent = records.filter((r) => r.status === "ABSENT").length
                const presentPercentage = Math.round((present / totalSessions) * 100)

                return (
                  <Card key={courseId}>
                    <CardHeader>
                      <CardTitle>
                        {course.code} - {course.title}
                      </CardTitle>
                      <CardDescription>{course.department.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                          <div className="bg-green-50 px-4 py-2 rounded-md">
                            <div className="text-green-600 font-bold">{present}</div>
                            <div className="text-xs">Present</div>
                          </div>
                          <div className="bg-yellow-50 px-4 py-2 rounded-md">
                            <div className="text-yellow-600 font-bold">{late}</div>
                            <div className="text-xs">Late</div>
                          </div>
                          <div className="bg-red-50 px-4 py-2 rounded-md">
                            <div className="text-red-600 font-bold">{absent}</div>
                            <div className="text-xs">Absent</div>
                          </div>
                          <div className="bg-blue-50 px-4 py-2 rounded-md">
                            <div className="text-blue-600 font-bold">{totalSessions}</div>
                            <div className="text-xs">Total Sessions</div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Attendance Rate: {presentPercentage}%</div>
                          <Progress value={presentPercentage} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
