"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, Clock, GraduationCap, BookOpen, FileText } from "lucide-react"
import { format } from "date-fns"

type CalendarEvent = {
  id: string
  title: string
  description: string
  date: Date
  endDate?: Date
  type: "registration" | "exam" | "holiday" | "semester" | "other"
  semesterId?: string
}

export function AcademicCalendarView() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("calendar")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/academic-calendar")
        if (!response.ok) throw new Error("Failed to fetch calendar events")
        const data = await response.json()

        // Convert string dates to Date objects
        const formattedEvents = data.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
        }))

        setEvents(formattedEvents)
      } catch (error) {
        console.error("Error fetching calendar events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Get events for the selected date
  const selectedDateEvents = selectedDate
    ? events.filter((event) => {
        const eventDate = new Date(event.date)
        const selectedDateObj = new Date(selectedDate)

        // Check if it's the same day
        return (
          eventDate.getDate() === selectedDateObj.getDate() &&
          eventDate.getMonth() === selectedDateObj.getMonth() &&
          eventDate.getFullYear() === selectedDateObj.getFullYear()
        )
      })
    : []

  // Get upcoming events (next 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate >= today && eventDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Function to get event badge color based on type
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "registration":
        return "bg-blue-100 text-blue-800"
      case "exam":
        return "bg-red-100 text-red-800"
      case "holiday":
        return "bg-green-100 text-green-800"
      case "semester":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Function to get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "exam":
        return <BookOpen className="h-4 w-4 text-red-600" />
      case "holiday":
        return <CalendarIcon className="h-4 w-4 text-green-600" />
      case "semester":
        return <GraduationCap className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Function to highlight dates with events
  const isDayWithEvent = (date: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    )
  }

  // Mock data for demonstration (will be replaced with actual data from API)
  if (events.length === 0) {
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Course Registration Begins",
        description: "Registration for the Fall semester opens for all students",
        date: new Date(2025, 3, 20), // April 20, 2025
        type: "registration",
      },
      {
        id: "2",
        title: "Course Registration Deadline",
        description: "Last day to register for Fall semester courses",
        date: new Date(2025, 4, 5), // May 5, 2025
        type: "registration",
      },
      {
        id: "3",
        title: "Final Examinations Begin",
        description: "Final exams for the Spring semester",
        date: new Date(2025, 4, 15), // May 15, 2025
        type: "exam",
      },
      {
        id: "4",
        title: "Summer Break Begins",
        description: "Summer vacation period starts",
        date: new Date(2025, 5, 1), // June 1, 2025
        type: "holiday",
      },
      {
        id: "5",
        title: "Fall Semester Begins",
        description: "First day of classes for the Fall semester",
        date: new Date(2025, 7, 25), // August 25, 2025
        type: "semester",
      },
    ]
    setEvents(mockEvents)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Academic Calendar</CardTitle>
                <CardDescription>View and navigate important academic dates</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: (date) => isDayWithEvent(date),
                  }}
                  modifiersStyles={{
                    hasEvent: { fontWeight: "bold", backgroundColor: "#f3f4f6", color: "#4f46e5" },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}</CardTitle>
                <CardDescription>
                  {selectedDateEvents.length === 0
                    ? "No events scheduled"
                    : `${selectedDateEvents.length} event(s) scheduled`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events scheduled for this date.</p>
                  ) : (
                    selectedDateEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <h4 className="font-medium">{event.title}</h4>
                          </div>
                          <Badge className={getEventBadgeColor(event.type)}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events in the next 30 days.</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                      <div className="min-w-[60px] text-center">
                        <div className="font-medium">{format(new Date(event.date), "MMM")}</div>
                        <div className="text-2xl font-bold">{format(new Date(event.date), "d")}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={getEventBadgeColor(event.type)}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Academic Events</CardTitle>
              <CardDescription>Complete list of academic events for the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {events.length === 0 ? (
                  <p className="text-muted-foreground">No events scheduled.</p>
                ) : (
                  // Group events by month
                  Object.entries(
                    events.reduce((acc: Record<string, CalendarEvent[]>, event) => {
                      const monthYear = format(new Date(event.date), "MMMM yyyy")
                      if (!acc[monthYear]) acc[monthYear] = []
                      acc[monthYear].push(event)
                      return acc
                    }, {}),
                  ).map(([monthYear, monthEvents]) => (
                    <div key={monthYear} className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">{monthYear}</h3>
                      <div className="space-y-3">
                        {monthEvents
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((event) => (
                            <div key={event.id} className="flex items-start gap-4 border-b pb-3 last:border-0">
                              <div className="min-w-[50px] text-center">
                                <div className="text-xl font-bold">{format(new Date(event.date), "d")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(event.date), "EEE")}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getEventIcon(event.type)}
                                    <h4 className="font-medium">{event.title}</h4>
                                  </div>
                                  <Badge className={getEventBadgeColor(event.type)}>
                                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
