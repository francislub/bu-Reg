"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  type?: string
}

interface UpcomingEventsProps {
  events?: Event[]
}

export function UpcomingEvents({ events: initialEvents }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents || [])
  const [isLoading, setIsLoading] = useState(!initialEvents)

  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents)
      setIsLoading(false)
      return
    }

    async function fetchEvents() {
      try {
        const response = await fetch("/api/events")
        const data = await response.json()

        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [initialEvents])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  function getDaysUntil(dateString: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(dateString)
    eventDate.setHours(0, 0, 0, 0)

    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `In ${diffDays} days`
  }

  return (
    <Card className="border-success/20 shadow-md">
      <CardHeader className="bg-success/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-success">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <CardDescription>Stay informed about upcoming university events</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground transition-colors hover:text-primary">{event.title}</h3>
                  <Badge variant="outline" className="bg-success/10">
                    {getDaysUntil(event.date)}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <div className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {format(new Date(event.date), "MMM d, yyyy")}
                  </div>
                  {event.location && (
                    <span className="ml-2 pl-2 border-l border-muted-foreground/30">{event.location}</span>
                  )}
                </div>
                {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No upcoming events at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
