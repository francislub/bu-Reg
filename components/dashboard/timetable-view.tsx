"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TimetableView() {
  const [selectedSemester, setSelectedSemester] = useState("current")

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = [
    "8:00 AM - 9:30 AM",
    "9:45 AM - 11:15 AM",
    "11:30 AM - 1:00 PM",
    "2:00 PM - 3:30 PM",
    "3:45 PM - 5:15 PM",
  ]

  const timetableData = {
    Monday: {
      "8:00 AM - 9:30 AM": {
        course: "CS101",
        title: "Introduction to Computer Science",
        room: "LR-201",
      },
      "11:30 AM - 1:00 PM": {
        course: "MATH201",
        title: "Calculus II",
        room: "LR-105",
      },
      "3:45 PM - 5:15 PM": {
        course: "ENG105",
        title: "Academic Writing",
        room: "LR-302",
      },
    },
    Tuesday: {
      "9:45 AM - 11:15 AM": {
        course: "PHYS202",
        title: "Electricity and Magnetism",
        room: "LR-203",
      },
      "2:00 PM - 3:30 PM": {
        course: "BUS220",
        title: "Principles of Marketing",
        room: "LR-401",
      },
    },
    Wednesday: {
      "8:00 AM - 9:30 AM": {
        course: "CS101",
        title: "Introduction to Computer Science",
        room: "LR-201",
      },
      "11:30 AM - 1:00 PM": {
        course: "MATH201",
        title: "Calculus II",
        room: "LR-105",
      },
    },
    Thursday: {
      "9:45 AM - 11:15 AM": {
        course: "PHYS202",
        title: "Electricity and Magnetism",
        room: "LR-203",
      },
      "3:45 PM - 5:15 PM": {
        course: "ENG105",
        title: "Academic Writing",
        room: "LR-302",
      },
    },
    Friday: {
      "11:30 AM - 1:00 PM": {
        course: "BUS220",
        title: "Principles of Marketing",
        room: "LR-401",
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Class Timetable</CardTitle>
            <CardDescription>Your weekly class schedule for the semester.</CardDescription>
          </div>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted">Time</th>
                    {weekdays.map((day) => (
                      <th key={day} className="border p-2 bg-muted">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border p-2 font-medium text-sm">{timeSlot}</td>
                      {weekdays.map((day) => {
                        const classInfo = timetableData[day]?.[timeSlot]
                        return (
                          <td key={`${day}-${timeSlot}`} className="border p-2">
                            {classInfo ? (
                              <div className="bg-blue-50 p-2 rounded-md">
                                <div className="font-semibold text-sm">{classInfo.course}</div>
                                <div className="text-xs text-gray-600">{classInfo.title}</div>
                                <div className="text-xs text-gray-500 mt-1">Room: {classInfo.room}</div>
                              </div>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="daily" className="mt-4">
            <div className="grid gap-4">
              {weekdays.map((day) => (
                <div key={day} className="border rounded-md p-4">
                  <h3 className="font-semibold text-lg mb-2">{day}</h3>
                  <div className="space-y-3">
                    {timeSlots.map((timeSlot) => {
                      const classInfo = timetableData[day]?.[timeSlot]
                      return classInfo ? (
                        <div key={`${day}-${timeSlot}`} className="flex items-center gap-4 p-3 bg-blue-50 rounded-md">
                          <div className="text-sm font-medium w-32 shrink-0">{timeSlot}</div>
                          <div>
                            <div className="font-semibold">
                              {classInfo.course}: {classInfo.title}
                            </div>
                            <div className="text-sm text-gray-500">Room: {classInfo.room}</div>
                          </div>
                        </div>
                      ) : null
                    })}
                    {!Object.keys(timetableData[day] || {}).length && (
                      <p className="text-muted-foreground text-sm">No classes scheduled for this day.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
