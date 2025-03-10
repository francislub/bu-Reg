"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  enrolledCount: number
  maxCapacity: number
}

interface FacultyCoursesProps {
  facultyId: string
}

export function FacultyCourses({ facultyId }: FacultyCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses([
        {
          id: "1",
          code: "CSC101",
          title: "Introduction to Computer Science",
          credits: 3,
          enrolledCount: 30,
          maxCapacity: 50,
        },
        {
          id: "2",
          code: "CSC201",
          title: "Data Structures and Algorithms",
          credits: 4,
          enrolledCount: 25,
          maxCapacity: 40,
        },
        {
          id: "3",
          code: "CSC301",
          title: "Database Systems",
          credits: 3,
          enrolledCount: 35,
          maxCapacity: 45,
        },
        {
          id: "4",
          code: "CSC401",
          title: "Software Engineering",
          credits: 4,
          enrolledCount: 30,
          maxCapacity: 40,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [facultyId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="border rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {course.code}: {course.title}
              </h3>
              <p className="text-sm text-gray-500">{course.credits} credits</p>
            </div>
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-1 text-blue-500" />
              <span>
                {course.enrolledCount}/{course.maxCapacity}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

