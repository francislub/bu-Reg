"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getActiveSemester } from "@/lib/actions/semester-actions"
import { getPublishedTimetable } from "@/lib/actions/timetable-actions"
import { PrintTimetable } from "@/components/dashboard/print-timetable"

export default function TimetablePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeSemester, setActiveSemester] = useState<any>(null)
  const [timetable, setTimetable] = useState<any>(null)
  const [showPrintView, setShowPrintView] = useState(false)

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = [
    "8:00 AM - 9:30 AM",
    "9:45 AM - 11:15 AM",
    "11:30 AM - 1:00 PM",
    "2:00 PM - 3:30 PM",
    "3:45 PM - 5:15 PM",
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Get active semester
        const semesterResult = await getActiveSemester()
        if (semesterResult.success) {
          setActiveSemester(semesterResult.semester)

          // Get published timetable for this semester
          const timetableResult = await getPublishedTimetable(semesterResult.semester.id)
          if (timetableResult.success) {
            setTimetable(timetableResult.timetable)
          } else {
            toast({
              title: "Timetable Not Available",
              description: "No published timetable found for the current semester.",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "No Active Semester",
            description: "There is no active semester at the moment.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching timetable data:", error)
        toast({
          title: "Error",
          description: "Failed to load timetable data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Organize timetable data by day and time
  const timetableData: Record<string, Record<string, any>> = {}

  if (timetable?.slots) {
    weekdays.forEach((day) => {
      timetableData[day] = {}
    })

    timetable.slots.forEach((slot: any) => {
      const day = weekdays[slot.dayOfWeek - 1] // Convert 1-based to 0-based index
      const timeKey = `${slot.startTime} - ${slot.endTime}`

      if (!timetableData[day]) {
        timetableData[day] = {}
      }

      timetableData[day][timeKey] = slot
    })
  }

  if (showPrintView && timetable) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Timetable" text="View and print your class schedule.">
          <Button variant="outline" onClick={() => setShowPrintView(false)}>
            Back to Timetable
          </Button>
        </DashboardHeader>

        <PrintTimetable timetable={timetable} studentName={session?.user?.name || undefined} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Timetable" text="View your class schedule.">
        {timetable && (
          <Button variant="outline" onClick={() => setShowPrintView(true)}>
            Print Timetable
          </Button>
        )}
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : timetable ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Class Timetable</CardTitle>
                <CardDescription>
                  Your weekly class schedule for {activeSemester?.name || "the current semester"}.
                </CardDescription>
              </div>
              <Select defaultValue="current">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">{activeSemester?.name || "Current Semester"}</SelectItem>
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
                            // Find a slot that matches this day and has a time range that includes this timeSlot
                            const matchingSlots = Object.entries(timetableData[day] || {}).filter(([slotTime]) => {
                              return (
                                slotTime === timeSlot ||
                                (timetableData[day][timeSlot] && timetableData[day][timeSlot].id)
                              )
                            })

                            const slot = matchingSlots.length > 0 ? timetableData[day][matchingSlots[0][0]] : null

                            return (
                              <td key={`${day}-${timeSlot}`} className="border p-2">
                                {slot ? (
                                  <div className="bg-blue-50 p-2 rounded-md">
                                    <div className="font-semibold text-sm">{slot.course.code}</div>
                                    <div className="text-xs text-gray-600">{slot.course.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">Room: {slot.roomNumber}</div>
                                    {slot.lecturerCourse && (
                                      <div className="text-xs text-gray-500">
                                        Lecturer: {slot.lecturerCourse.lecturer.profile.firstName}{" "}
                                        {slot.lecturerCourse.lecturer.profile.lastName}
                                      </div>
                                    )}
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
                  {weekdays.map((day) => {
                    const daySlots = Object.entries(timetableData[day] || {})

                    return (
                      <div key={day} className="border rounded-md p-4">
                        <h3 className="font-semibold text-lg mb-2">{day}</h3>
                        <div className="space-y-3">
                          {daySlots.length > 0 ? (
                            daySlots.map(([timeSlot, slot]) => (
                              <div
                                key={`${day}-${timeSlot}`}
                                className="flex items-center gap-4 p-3 bg-blue-50 rounded-md"
                              >
                                <div className="text-sm font-medium w-32 shrink-0">{timeSlot}</div>
                                <div>
                                  <div className="font-semibold">
                                    {slot.course.code}: {slot.course.title}
                                  </div>
                                  <div className="text-sm text-gray-500">Room: {slot.roomNumber}</div>
                                  {slot.lecturerCourse && (
                                    <div className="text-sm text-gray-500">
                                      Lecturer: {slot.lecturerCourse.lecturer.profile.firstName}{" "}
                                      {slot.lecturerCourse.lecturer.profile.lastName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">No classes scheduled for this day.</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium">No Timetable Available</h3>
              <p className="text-muted-foreground mt-2">
                No published timetable is available for the current semester. Please check back later or contact the
                registrar's office.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}
