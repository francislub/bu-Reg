"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Student {
  id: string
  name: string
  registrationNo: string
  email: string
}

interface Course {
  id: string
  code: string
  title: string
}

interface EnrolledStudentsProps {
  facultyId: string
}

export function EnrolledStudents({ facultyId }: EnrolledStudentsProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch courses
    setTimeout(() => {
      setCourses([
        {
          id: "1",
          code: "CSC101",
          title: "Introduction to Computer Science",
        },
        {
          id: "2",
          code: "CSC201",
          title: "Data Structures and Algorithms",
        },
        {
          id: "3",
          code: "CSC301",
          title: "Database Systems",
        },
        {
          id: "4",
          code: "CSC401",
          title: "Software Engineering",
        },
      ])
      setSelectedCourse("1")
      setLoading(false)
    }, 1000)
  }, [facultyId])

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true)
      // Simulate API call to fetch students for the selected course
      setTimeout(() => {
        setStudents([
          {
            id: "s1",
            name: "John Doe",
            registrationNo: "21/BCC/BUR/0026",
            email: "john@example.com",
          },
          {
            id: "s2",
            name: "Jane Smith",
            registrationNo: "21/BCC/BUR/0027",
            email: "jane@example.com",
          },
          {
            id: "s3",
            name: "Bob Johnson",
            registrationNo: "21/BCC/BUR/0028",
            email: "bob@example.com",
          },
        ])
        setLoading(false)
      }, 500)
    }
  }, [selectedCourse])

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
  }

  if (loading && courses.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Select value={selectedCourse} onValueChange={handleCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.code}: {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div>
          {students.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No students enrolled in this course</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-xs text-gray-500">{student.registrationNo}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  Export Student List
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

