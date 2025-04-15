"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Search, Download, Printer, Filter, Building } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { userRoles } from "@/lib/utils"

type ExamSchedule = {
  id: string
  courseId: string
  course: {
    id: string
    code: string
    title: string
    credits: number
    department: {
      id: string
      name: string
      code: string
    }
  }
  date: string
  startTime: string
  endTime: string
  venue: string
  examType: "MIDTERM" | "FINAL" | "SUPPLEMENTARY"
  semesterId: string
  semester: {
    id: string
    name: string
    isActive: boolean
  }
}

export function ExamScheduleView({ userId, userRole }: { userId: string; userRole: string }) {
  const { toast } = useToast()
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<ExamSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [examTypeFilter, setExamTypeFilter] = useState("")
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [semesters, setSemesters] = useState<{ id: string; name: string; isActive: boolean }[]>([])
  const [selectedSemester, setSelectedSemester] = useState("")
  const [viewMode, setViewMode] = useState("calendar")

  useEffect(() => {
    const fetchExamSchedules = async () => {
      try {
        // Different API endpoints based on user role
        let url = "/api/exam-schedules"
        if (userRole === userRoles.STUDENT) {
          url = `/api/students/${userId}/exam-schedules`
        } else if (userRole === userRoles.STAFF) {
          url = `/api/faculty/${userId}/exam-schedules`
        }

        if (selectedSemester) {
          url += `?semesterId=${selectedSemester}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch exam schedules")
        const data = await response.json()
        setExamSchedules(data)
        setFilteredSchedules(data)
      } catch (error) {
        console.error("Error fetching exam schedules:", error)
        toast({
          title: "Error",
          description: "Failed to load exam schedules. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        if (!response.ok) throw new Error("Failed to fetch departments")
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }

    const fetchSemesters = async () => {
      try {
        const response = await fetch("/api/semesters")
        if (!response.ok) throw new Error("Failed to fetch semesters")
        const data = await response.json()
        setSemesters(data)

        // Set the active semester as default
        const activeSemester = data.find((sem: any) => sem.isActive)
        if (activeSemester) {
          setSelectedSemester(activeSemester.id)
        }
      } catch (error) {
        console.error("Error fetching semesters:", error)
      }
    }

    fetchDepartments()
    fetchSemesters()
    fetchExamSchedules()
  }, [userId, userRole, selectedSemester, toast])

  useEffect(() => {
    // Filter exam schedules based on search query, department filter, and exam type filter
    const filtered = examSchedules.filter((schedule) => {
      const matchesSearch =
        schedule.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.venue.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDepartment = departmentFilter ? schedule.course.department.id === departmentFilter : true
      const matchesExamType = examTypeFilter ? schedule.examType === examTypeFilter : true

      return matchesSearch && matchesDepartment && matchesExamType
    })

    setFilteredSchedules(filtered)
  }, [searchQuery, departmentFilter, examTypeFilter, examSchedules])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Course Code", "Course Title", "Date", "Start Time", "End Time", "Venue", "Exam Type"]
    const rows = filteredSchedules.map((schedule) => [
      schedule.course.code,
      schedule.course.title,
      format(new Date(schedule.date), "yyyy-MM-dd"),
      schedule.startTime,
      schedule.endTime,
      schedule.venue,
      schedule.examType,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "exam_schedule.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Group exams by date for calendar view
  const examsByDate = filteredSchedules.reduce((acc: Record<string, ExamSchedule[]>, schedule) => {
    const dateStr = format(new Date(schedule.date), "yyyy-MM-dd")
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(schedule)
    return acc
  }, {})

  // If no exam schedules are available, show mock data
  if (examSchedules.length === 0 && !isLoading) {
    // Mock data for demonstration
    const mockExamSchedules: ExamSchedule[] = [
      {
        id: "1",
        courseId: "1",
        course: {
          id: "1",
          code: "CS101",
          title: "Introduction to Computer Science",
          credits: 3,
          department: {
            id: "1",
            name: "Computer Science",
            code: "CS",
          },
        },
        date: "2025-05-15",
        startTime: "09:00",
        endTime: "12:00",
        venue: "Main Hall A",
        examType: "FINAL",
        semesterId: "1",
        semester: {
          id: "1",
          name: "Spring 2025",
          isActive: true,
        },
      },
      {
        id: "2",
        courseId: "2",
        course: {
          id: "2",
          code: "CS201",
          title: "Data Structures",
          credits: 4,
          department: {
            id: "1",
            name: "Computer Science",
            code: "CS",
          },
        },
        date: "2025-05-17",
        startTime: "14:00",
        endTime: "17:00",
        venue: "Main Hall B",
        examType: "FINAL",
        semesterId: "1",
        semester: {
          id: "1",
          name: "Spring 2025",
          isActive: true,
        },
      },
      {
        id: "3",
        courseId: "3",
        course: {
          id: "3",
          code: "BA101",
          title: "Introduction to Business",
          credits: 3,
          department: {
            id: "2",
            name: "Business Administration",
            code: "BA",
          },
        },
        date: "2025-05-18",
        startTime: "09:00",
        endTime: "12:00",
        venue: "Room 101",
        examType: "FINAL",
        semesterId: "1",
        semester: {
          id: "1",
          name: "Spring 2025",
          isActive: true,
        },
      },
      {
        id: "4",
        courseId: "4",
        course: {
          id: "4",
          code: "ENG101",
          title: "Engineering Principles",
          credits: 3,
          department: {
            id: "3",
            name: "Engineering",
            code: "ENG",
          },
        },
        date: "2025-05-20",
        startTime: "09:00",
        endTime: "12:00",
        venue: "Engineering Lab",
        examType: "FINAL",
        semesterId: "1",
        semester: {
          id: "1",
          name: "Spring 2025",
          isActive: true,
        },
      },
      {
        id: "5",
        courseId: "5",
        course: {
          id: "5",
          code: "MATH101",
          title: "Calculus I",
          credits: 4,
          department: {
            id: "4",
            name: "Mathematics",
            code: "MATH",
          },
        },
        date: "2025-05-22",
        startTime: "14:00",
        endTime: "17:00",
        venue: "Main Hall A",
        examType: "FINAL",
        semesterId: "1",
        semester: {
          id: "1",
          name: "Spring 2025",
          isActive: true,
        },
      },
    ]

    setExamSchedules(mockExamSchedules)
    setFilteredSchedules(mockExamSchedules)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by course or venue..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="All Exam Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exam Types</SelectItem>
              <SelectItem value="MIDTERM">Midterm</SelectItem>
              <SelectItem value="FINAL">Final</SelectItem>
              <SelectItem value="SUPPLEMENTARY">Supplementary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name} {semester.isActive ? "(Active)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1 border rounded-md">
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode("list")}
            >
              <Filter className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>

      {filteredSchedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No exam schedules found</p>
            <p className="text-xs text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <div className="space-y-6">
          {Object.entries(examsByDate)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([dateStr, schedules]) => (
              <Card key={dateStr}>
                <CardHeader>
                  <CardTitle>{format(new Date(dateStr), "EEEE, MMMM d, yyyy")}</CardTitle>
                  <CardDescription>{schedules.length} exams scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schedules
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-col md:flex-row gap-4 border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="md:w-1/4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{schedule.venue}</span>
                            </div>
                          </div>
                          <div className="md:w-2/4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{schedule.course.code}</span>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                {schedule.course.department.code}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">{schedule.course.title}</p>
                          </div>
                          <div className="md:w-1/4 flex items-center justify-end">
                            <Badge
                              className={
                                schedule.examType === "FINAL"
                                  ? "bg-red-100 text-red-800"
                                  : schedule.examType === "MIDTERM"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-purple-100 text-purple-800"
                              }
                            >
                              {schedule.examType.charAt(0) + schedule.examType.slice(1).toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Exam Schedule</CardTitle>
            <CardDescription>
              {filteredSchedules.length} {filteredSchedules.length === 1 ? "exam" : "exams"} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Course
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Venue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((schedule) => (
                      <tr key={schedule.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{schedule.course.code}</div>
                              <div className="text-sm text-gray-500">{schedule.course.title}</div>
                              <div className="text-xs text-gray-500">{schedule.course.department.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(schedule.date), "EEE, MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{schedule.venue}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              schedule.examType === "FINAL"
                                ? "bg-red-100 text-red-800"
                                : schedule.examType === "MIDTERM"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-purple-100 text-purple-800"
                            }
                          >
                            {schedule.examType.charAt(0) + schedule.examType.slice(1).toLowerCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
