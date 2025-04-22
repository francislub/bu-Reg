"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AttendanceTableProps {
  initialData?: any[]
  userRole?: string
}

export function AttendanceTable({ initialData = [], userRole = "STUDENT" }: AttendanceTableProps) {
  const { data: session } = useSession()
  const role = userRole || session?.user?.role || "STUDENT"
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceRecords, setAttendanceRecords] = useState(initialData)

  // If no data is provided, use sample data
  const studentAttendance =
    initialData.length > 0
      ? initialData
      : [
          {
            id: "1",
            course: "CS101",
            title: "Introduction to Computer Science",
            date: "2023-09-10",
            status: "Present",
            percentage: "100%",
          },
          {
            id: "2",
            course: "MATH201",
            title: "Calculus II",
            date: "2023-09-11",
            status: "Present",
            percentage: "90%",
          },
          {
            id: "3",
            course: "ENG105",
            title: "Academic Writing",
            date: "2023-09-12",
            status: "Absent",
            percentage: "80%",
          },
          {
            id: "4",
            course: "BUS220",
            title: "Principles of Marketing",
            date: "2023-09-13",
            status: "Present",
            percentage: "100%",
          },
          {
            id: "5",
            course: "PHYS202",
            title: "Electricity and Magnetism",
            date: "2023-09-14",
            status: "Late",
            percentage: "85%",
          },
        ]

  const staffAttendance =
    initialData.length > 0
      ? initialData
      : [
          {
            id: "1",
            course: "CS101",
            title: "Introduction to Computer Science",
            date: "2023-09-10",
            students: 35,
            present: 32,
            percentage: "91%",
          },
          {
            id: "2",
            course: "CS101",
            title: "Introduction to Computer Science",
            date: "2023-09-12",
            students: 35,
            present: 30,
            percentage: "86%",
          },
          {
            id: "3",
            course: "CS205",
            title: "Data Structures",
            date: "2023-09-11",
            students: 28,
            present: 25,
            percentage: "89%",
          },
          {
            id: "4",
            course: "CS205",
            title: "Data Structures",
            date: "2023-09-13",
            students: 28,
            present: 26,
            percentage: "93%",
          },
          {
            id: "5",
            course: "CS310",
            title: "Database Systems",
            date: "2023-09-14",
            students: 22,
            present: 20,
            percentage: "91%",
          },
        ]

  // Filter attendance records based on search term and selected course
  const filteredAttendance =
    role === "STUDENT"
      ? studentAttendance.filter(
          (record) =>
            record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : staffAttendance.filter(
          (record) =>
            (selectedCourse === "all" || record.course === selectedCourse) &&
            (record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
              record.title.toLowerCase().includes(searchTerm.toLowerCase())),
        )

  // Get unique courses for the filter dropdown
  const uniqueCourses =
    role === "STUDENT"
      ? [...new Set(studentAttendance.map((record) => record.course))]
      : [...new Set(staffAttendance.map((record) => record.course))]

  // Set the appropriate color scheme based on user role
  const colorScheme = role === "STUDENT" ? "blue" : role === "STAFF" ? "green" : "purple"

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {role === "STUDENT" ? "Your attendance for this semester." : "Student attendance for your courses."}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {role !== "STUDENT" && (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="hidden md:table-cell">Title</TableHead>
              <TableHead>Date</TableHead>
              {role === "STUDENT" ? (
                <TableHead>Status</TableHead>
              ) : (
                <>
                  <TableHead className="hidden md:table-cell">Students</TableHead>
                  <TableHead>Present</TableHead>
                </>
              )}
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.course}</TableCell>
                  <TableCell className="hidden md:table-cell">{record.title}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  {role === "STUDENT" ? (
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "Present" ? "success" : record.status === "Late" ? "warning" : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="hidden md:table-cell">{record.students}</TableCell>
                      <TableCell>{record.present}</TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <Badge variant="outline">{record.percentage}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={role === "STUDENT" ? 5 : 6} className="text-center py-6 text-muted-foreground">
                  {searchTerm || selectedCourse !== "all"
                    ? "No matching attendance records found."
                    : "No attendance records available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
