"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Printer } from "lucide-react"

type Course = {
  id: string
  code: string
  title: string
}

type LecturerCourse = {
  id: string
  lecturer: {
    id: string
    name: string
  }
  course: Course
}

type TimetableSlot = {
  id: string
  timetableId: string
  courseId: string
  lecturerCourseId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomNumber: string
  course: Course
  lecturerCourse?: LecturerCourse
}

type Timetable = {
  id: string
  name: string
  slots: TimetableSlot[]
}

type StaffTimetableData = {
  timetable: Timetable
  slots: TimetableSlot[]
}

interface StaffTimetableProps {
  userId: string
}

export function StaffTimetable({ userId }: StaffTimetableProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [timetableData, setTimetableData] = useState<StaffTimetableData | null>(null)

  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users/${userId}/timetable`)

        if (!res.ok) {
          if (res.status === 404) {
            setTimetableData(null)
            return
          }
          throw new Error("Failed to fetch timetable")
        }

        const data = await res.json()
        setTimetableData(data)
      } catch (error) {
        console.error("Error fetching timetable:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your timetable. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimetable()
  }, [userId, toast])

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Group slots by day
  const slotsByDay =
    timetableData?.slots.reduce(
      (acc, slot) => {
        const day = slot.dayOfWeek.toString()
        if (!acc[day]) {
          acc[day] = []
        }
        acc[day].push(slot)
        return acc
      },
      {} as Record<string, TimetableSlot[]>,
    ) || {}

  // Sort days
  const sortedDays = Object.keys(slotsByDay).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

  // Sort slots by start time
  Object.keys(slotsByDay).forEach((day) => {
    slotsByDay[day].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  })

  // Format time (convert 24h to 12h format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
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
            {[1, 2, 3].map((day) => (
              <div key={day} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2].map((slot) => (
                    <Skeleton key={slot} className="h-32 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!timetableData) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No timetable available</AlertTitle>
        <AlertDescription>
          There is no published timetable for your assigned courses this semester. Please check back later or contact
          the registrar's office.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{timetableData.timetable.name}</CardTitle>
          <CardDescription>Your class schedule for the current semester</CardDescription>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </CardHeader>
      <CardContent>
        <div className="hidden print:block text-center mb-4">
          <h1 className="text-2xl font-bold">{timetableData.timetable.name}</h1>
          <p className="text-lg">Lecturer Schedule</p>
        </div>

        <div className="space-y-6 print:space-y-4">
          {sortedDays.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No classes scheduled for you this semester.</p>
            </div>
          ) : (
            sortedDays.map((day) => (
              <div key={day} className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">{dayNames[Number.parseInt(day)]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slotsByDay[day].map((slot) => (
                    <Card key={slot.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-primary p-3 text-primary-foreground">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{slot.course.code}</h4>
                            <Badge variant="secondary" className="ml-2">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1 truncate">{slot.course.title}</p>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Room:</span>
                            <span className="text-sm">{slot.roomNumber}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
