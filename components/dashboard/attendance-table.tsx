"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AttendanceTable() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"
  const [selectedCourse, setSelectedCourse] = useState("all")

  const studentAttendance = [
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

  const staffAttendance = [
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

  const filteredAttendance =
    userRole === "STUDENT"
      ? studentAttendance
      : selectedCourse === "all"
        ? staffAttendance
        : staffAttendance.filter((record) => record.course === selectedCourse)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {userRole === "STUDENT" ? "Your attendance for this semester." : "Student attendance for your courses."}
            </CardDescription>
          </div>
          {userRole !== "STUDENT" && (
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="CS101">CS101</SelectItem>
                <SelectItem value="CS205">CS205</SelectItem>
                <SelectItem value="CS310">CS310</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              {userRole === "STUDENT" ? (
                <TableHead>Status</TableHead>
              ) : (
                <>
                  <TableHead>Students</TableHead>
                  <TableHead>Present</TableHead>
                </>
              )}
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.course}</TableCell>
                <TableCell>{record.title}</TableCell>
                <TableCell>{record.date}</TableCell>
                {userRole === "STUDENT" ? (
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
                    <TableCell>{record.students}</TableCell>
                    <TableCell>{record.present}</TableCell>
                  </>
                )}
                <TableCell>{record.percentage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
