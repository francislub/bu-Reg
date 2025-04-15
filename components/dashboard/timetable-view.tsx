"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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

interface TimetableViewProps {
  timetable: Timetable
}

export function TimetableView({ timetable }: TimetableViewProps) {
  const [filterDay, setFilterDay] = useState<string>("all")

  const days = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ]

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Group slots by day
  const slotsByDay = timetable.slots.reduce(
    (acc, slot) => {
      const day = slot.dayOfWeek.toString()
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(slot)
      return acc
    },
    {} as Record<string, TimetableSlot[]>,
  )

  // Sort slots by start time
  Object.keys(slotsByDay).forEach((day) => {
    slotsByDay[day].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  })

  // Filter days based on selection
  const daysToShow =
    filterDay === "all" ? Object.keys(slotsByDay).sort((a, b) => Number.parseInt(a) - Number.parseInt(b)) : [filterDay]

  // Format time (convert 24h to 12h format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between print:hidden">
        <h2 className="text-xl font-semibold">{timetable.name}</h2>
        <div className="mt-2 sm:mt-0 w-full sm:w-64">
          <Label htmlFor="filter-day">Filter by Day</Label>
          <Select value={filterDay} onValueChange={setFilterDay}>
            <SelectTrigger id="filter-day">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {days.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden print:block text-center mb-4">
        <h1 className="text-2xl font-bold">{timetable.name}</h1>
      </div>

      {daysToShow.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No classes scheduled for this timetable.</p>
        </div>
      ) : (
        daysToShow.map((day) => (
          <div key={day} className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">{dayNames[Number.parseInt(day)]}</h3>
            {slotsByDay[day].length === 0 ? (
              <p className="text-muted-foreground">No classes scheduled for this day.</p>
            ) : (
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
                          <span className="text-sm font-medium">Lecturer:</span>
                          <span className="text-sm">{slot.lecturerCourse?.lecturer.name || "Not assigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Room:</span>
                          <span className="text-sm">{slot.roomNumber}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          
          body {
            font-size: 12pt;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
