"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

interface Class {
  id: string
  courseCode: string
  courseTitle: string
  date: string
  startTime: string
  endTime: string
  location: string
  enrolledCount: number
}

export function UpcomingClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setClasses([
        {
          id: "1",
          courseCode: "CSC101",
          courseTitle: "Introduction to Computer Science",
          date: "2025-03-10",
          startTime: "09:00",
          endTime: "11:00",
          location: "Room A101",
          enrolledCount: 30,
        },
        {
          id: "2",
          courseCode: "CSC201",
          courseTitle: "Data Structures and Algorithms",
          date: "2025-03-11",
          startTime: "13:00",
          endTime: "15:00",
          location: "Room B202",
          enrolledCount: 25,
        },
        {
          id: "3",
          courseCode: "CSC301",
          courseTitle: "Database Systems",
          date: "2025-03-12",
          startTime: "10:00",
          endTime: "12:00",
          location: "Computer Lab 1",
          enrolledCount: 35,
        },
        {
          id: "4",
          courseCode: "CSC401",
          courseTitle: "Software Engineering",
          date: "2025-03-13",
          startTime: "14:00",
          endTime: "16:00",
          location: "Room C303",
          enrolledCount: 30,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  // Sort classes by date and time
  const sortedClasses = [...classes].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`)
    const dateB = new Date(`${b.date}T${b.startTime}`)
    return dateA.getTime() - dateB.getTime()
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4">
      {sortedClasses.map((classItem) => (
        <div key={classItem.id} className="border rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {classItem.courseCode}: {classItem.courseTitle}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(classItem.date)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {classItem.startTime} - {classItem.endTime}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {classItem.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {classItem.enrolledCount} students enrolled
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full">
        View Full Schedule
      </Button>
    </div>
  )
}

