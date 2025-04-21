import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Orientation Week",
      date: "2023-09-18",
      time: "9:00 AM - 4:00 PM",
      location: "Main Auditorium",
    },
    {
      id: 2,
      title: "Career Fair",
      date: "2023-09-25",
      time: "10:00 AM - 3:00 PM",
      location: "University Grounds",
    },
    {
      id: 3,
      title: "Guest Lecture: AI in Education",
      date: "2023-10-05",
      time: "2:00 PM - 4:00 PM",
      location: "Science Building, Room 302",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Don't miss out on these events</CardDescription>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{event.title}</h3>
                <span className="text-xs text-muted-foreground">{event.date}</span>
              </div>
              <div className="mt-1 flex flex-col text-sm text-muted-foreground">
                <span>{event.time}</span>
                <span>{event.location}</span>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            View All Events
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
