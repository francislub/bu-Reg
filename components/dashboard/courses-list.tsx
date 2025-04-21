"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileEdit, Trash2 } from "lucide-react"

export function CoursesList() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"
  const [courses, setCourses] = useState([
    {
      id: "1",
      code: "CS101",
      title: "Introduction to Computer Science",
      credits: 3,
      department: "Computer Science",
      status: "Approved",
    },
    {
      id: "2",
      code: "MATH201",
      title: "Calculus II",
      credits: 4,
      department: "Mathematics",
      status: "Approved",
    },
    {
      id: "3",
      code: "ENG105",
      title: "Academic Writing",
      credits: 3,
      department: "English",
      status: "Pending",
    },
    {
      id: "4",
      code: "BUS220",
      title: "Principles of Marketing",
      credits: 3,
      department: "Business Administration",
      status: "Approved",
    },
    {
      id: "5",
      code: "PHYS202",
      title: "Electricity and Magnetism",
      credits: 4,
      department: "Physics",
      status: "Pending",
    },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userRole === "STUDENT" ? "My Courses" : userRole === "REGISTRAR" ? "All Courses" : "Department Courses"}
        </CardTitle>
        <CardDescription>
          {userRole === "STUDENT"
            ? "Courses you are registered for this semester."
            : userRole === "REGISTRAR"
              ? "Manage all university courses."
              : "Manage courses in your department."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Department</TableHead>
              {userRole === "STUDENT" && <TableHead>Status</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.code}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>{course.department}</TableCell>
                {userRole === "STUDENT" && (
                  <TableCell>
                    <Badge variant={course.status === "Approved" ? "success" : "outline"}>{course.status}</Badge>
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {userRole !== "STUDENT" && (
                      <>
                        <Button variant="ghost" size="icon">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
