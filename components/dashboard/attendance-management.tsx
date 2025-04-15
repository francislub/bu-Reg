"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/dashboard/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Search, UserCheck, UserX, ClockIcon as UserClock, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"

type Course = {
  id: string
  code: string
  title: string
  department: {
    name: string
  }
}

type LecturerCourse = {
  id: string
  course: Course
  semester: {
    id: string
    name: string
  }
}

type Student = {
  id: string
  name: string
  email: string
  profile?: {
    firstName: string
    lastName: string
  }
}

type AttendanceRecord = {
  id: string
  sessionId: string
  studentId: string
  status: string
  comments?: string
  student: Student
}

type AttendanceSession = {
  id: string
  courseId: string
  lecturerId: string
  semesterId: string
  date: string
  startTime: string
  endTime: string
  topic?: string
  course: Course
  records: AttendanceRecord[]
}

interface AttendanceManagementProps {
  userId: string
}

export function AttendanceManagement({ userId }: AttendanceManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [lecturerCourses, setLecturerCourses] = useState<LecturerCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("sessions")
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    courseId: "",
    date: new Date(),
    startTime: "08:00",
    endTime: "10:00",
    topic: "",
  })
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({})
  const [comments, setComments] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch lecturer courses
        const coursesRes = await fetch(`/api/lecturer-courses?lecturerId=${userId}`)
        const coursesData = await coursesRes.json()
        setLecturerCourses(coursesData)

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].course.id)
          setFormData((prev) => ({ ...prev, courseId: coursesData[0].course.id }))

          // Fetch attendance sessions for the first course
          const sessionsRes = await fetch(
            `/api/attendance/sessions?lecturerId=${userId}&courseId=${coursesData[0].course.id}`,
          )
          const sessionsData = await sessionsRes.json()
          setAttendanceSessions(sessionsData)

          // Fetch students for the first course
          const studentsRes = await fetch(`/api/courses/${coursesData[0].course.id}/students`)
          const studentsData = await studentsRes.json()
          setStudents(studentsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, toast])

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourse(courseId)
    setIsLoading(true)

    try {
      // Fetch attendance sessions for the selected course
      const sessionsRes = await fetch(`/api/attendance/sessions?lecturerId=${userId}&courseId=${courseId}`)
      const sessionsData = await sessionsRes.json()
      setAttendanceSessions(sessionsData)

      // Fetch students for the selected course
      const studentsRes = await fetch(`/api/courses/${courseId}/students`)
      const studentsData = await studentsRes.json()
      setStudents(studentsData)

      // Update form data
      setFormData((prev) => ({ ...prev, courseId }))
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData((prev) => ({ ...prev, date }))
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.courseId || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lecturerId: userId,
          date: formData.date.toISOString(),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create attendance session")
      }

      const data = await res.json()

      toast({
        title: "Success",
        description: "Attendance session created successfully.",
      })

      // Refresh attendance sessions
      const sessionsRes = await fetch(`/api/attendance/sessions?lecturerId=${userId}&courseId=${selectedCourse}`)
      const sessionsData = await sessionsRes.json()
      setAttendanceSessions(sessionsData)

      // Reset form and close dialog
      setFormData({
        courseId: selectedCourse,
        date: new Date(),
        startTime: "08:00",
        endTime: "10:00",
        topic: "",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating attendance session:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create attendance session.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewSession = (session: AttendanceSession) => {
    setSelectedSession(session)

    // Initialize attendance records from session
    const records: Record<string, string> = {}
    const sessionComments: Record<string, string> = {}

    session.records.forEach((record) => {
      records[record.studentId] = record.status
      if (record.comments) {
        sessionComments[record.studentId] = record.comments
      }
    })

    setAttendanceRecords(records)
    setComments(sessionComments)
    setIsRecordDialogOpen(true)
  }

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleCommentChange = (studentId: string, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [studentId]: comment,
    }))
  }

  const handleSaveAttendance = async () => {
    if (!selectedSession) return

    setIsLoading(true)

    try {
      const records = students.map((student) => ({
        studentId: student.id,
        status: attendanceRecords[student.id] || "ABSENT",
        comments: comments[student.id] || "",
      }))

      const res = await fetch(`/api/attendance/sessions/${selectedSession.id}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save attendance records")
      }

      toast({
        title: "Success",
        description: "Attendance records saved successfully.",
      })

      // Refresh attendance sessions
      const sessionsRes = await fetch(`/api/attendance/sessions?lecturerId=${userId}&courseId=${selectedCourse}`)
      const sessionsData = await sessionsRes.json()
      setAttendanceSessions(sessionsData)

      setIsRecordDialogOpen(false)
    } catch (error) {
      console.error("Error saving attendance records:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save attendance records.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance session?")) {
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/attendance/sessions/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete attendance session")
      }

      toast({
        title: "Success",
        description: "Attendance session deleted successfully.",
      })

      // Refresh attendance sessions
      const sessionsRes = await fetch(`/api/attendance/sessions?lecturerId=${userId}&courseId=${selectedCourse}`)
      const sessionsData = await sessionsRes.json()
      setAttendanceSessions(sessionsData)
    } catch (error) {
      console.error("Error deleting attendance session:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete attendance session.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSessions = attendanceSessions.filter((session) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      session.course.code.toLowerCase().includes(searchLower) ||
      session.course.title.toLowerCase().includes(searchLower) ||
      (session.topic && session.topic.toLowerCase().includes(searchLower)) ||
      format(new Date(session.date), "PPP").toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getAttendanceStats = (session: AttendanceSession) => {
    const total = session.records.length
    const present = session.records.filter((r) => r.status === "PRESENT").length
    const absent = session.records.filter((r) => r.status === "ABSENT").length
    const late = session.records.filter((r) => r.status === "LATE").length

    return { total, present, absent, late }
  }

  const columns: ColumnDef<AttendanceSession>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "startTime",
      header: "Time",
      cell: ({ row }) => `${formatTime(row.original.startTime)} - ${formatTime(row.original.endTime)}`,
    },
    {
      accessorKey: "course.code",
      header: "Course",
      cell: ({ row }) => (
        <div>
          <div>{row.original.course.code}</div>
          <div className="text-xs text-muted-foreground">{row.original.course.title}</div>
        </div>
      ),
    },
    {
      accessorKey: "topic",
      header: "Topic",
      cell: ({ row }) => row.original.topic || "N/A",
    },
    {
      id: "attendance",
      header: "Attendance",
      cell: ({ row }) => {
        const stats = getAttendanceStats(row.original)
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50">
              <UserCheck className="h-3 w-3 mr-1 text-green-500" />
              {stats.present}
            </Badge>
            <Badge variant="outline" className="bg-red-50">
              <UserX className="h-3 w-3 mr-1 text-red-500" />
              {stats.absent}
            </Badge>
            <Badge variant="outline" className="bg-yellow-50">
              <UserClock className="h-3 w-3 mr-1 text-yellow-500" />
              {stats.late}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleViewSession(session)}>
              Take/View Attendance
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)}>
              <Trash className="h-4 w-4 text-red-500" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
          <CardDescription>Create and manage attendance sessions for your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Label htmlFor="course">Course</Label>
                <Select value={selectedCourse} onValueChange={handleCourseChange} disabled={isLoading}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerCourses.map((lc) => (
                      <SelectItem key={lc.id} value={lc.course.id}>
                        {lc.course.code} - {lc.course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-64">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search sessions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              disabled={isLoading || !selectedCourse}
              className="mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Attendance Session
            </Button>
          </div>

          <div className="mt-6">
            <DataTable
              columns={columns}
              data={filteredSessions}
              isLoading={isLoading}
              noDataText="No attendance sessions found"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Attendance Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Attendance Session</DialogTitle>
            <DialogDescription>
              Create a new attendance session for your course. You can take attendance after creating the session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSession}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="courseId">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => handleSelectChange("courseId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerCourses.map((lc) => (
                      <SelectItem key={lc.id} value={lc.course.id}>
                        {lc.course.code} - {lc.course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      className="pl-8"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      className="pl-8"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  name="topic"
                  placeholder="e.g., Introduction to Database Design"
                  value={formData.topic}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Take/View Attendance Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Attendance Records</DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <>
                  {selectedSession.course.code} - {selectedSession.course.title}
                  <br />
                  {formatDate(selectedSession.date)} | {formatTime(selectedSession.startTime)} -{" "}
                  {formatTime(selectedSession.endTime)}
                  {selectedSession.topic && <> | Topic: {selectedSession.topic}</>}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {students.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No students enrolled in this course.</p>
                </div>
              ) : (
                students.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-medium">
                          {student.profile ? `${student.profile.firstName} ${student.profile.lastName}` : student.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`present-${student.id}`}
                            checked={attendanceRecords[student.id] === "PRESENT"}
                            onCheckedChange={() => handleAttendanceChange(student.id, "PRESENT")}
                          />
                          <Label htmlFor={`present-${student.id}`} className="text-sm">
                            Present
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`late-${student.id}`}
                            checked={attendanceRecords[student.id] === "LATE"}
                            onCheckedChange={() => handleAttendanceChange(student.id, "LATE")}
                          />
                          <Label htmlFor={`late-${student.id}`} className="text-sm">
                            Late
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`absent-${student.id}`}
                            checked={attendanceRecords[student.id] === "ABSENT" || !attendanceRecords[student.id]}
                            onCheckedChange={() => handleAttendanceChange(student.id, "ABSENT")}
                          />
                          <Label htmlFor={`absent-${student.id}`} className="text-sm">
                            Absent
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Input
                        placeholder="Comments (optional)"
                        value={comments[student.id] || ""}
                        onChange={(e) => handleCommentChange(student.id, e.target.value)}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttendance} disabled={isLoading || students.length === 0}>
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
