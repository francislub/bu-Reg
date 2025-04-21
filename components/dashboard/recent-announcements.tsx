import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Megaphone } from "lucide-react"

export function RecentAnnouncements() {
  const announcements = [
    {
      id: 1,
      title: "Registration Deadline Extended",
      date: "2023-09-15",
      content: "The deadline for course registration has been extended to September 20th.",
    },
    {
      id: 2,
      title: "New Library Hours",
      date: "2023-09-10",
      content: "The university library will now be open from 7:00 AM to 10:00 PM on weekdays.",
    },
    {
      id: 3,
      title: "Campus Maintenance Notice",
      date: "2023-09-05",
      content:
        "The main campus will undergo maintenance on September 25th. Some facilities may be temporarily unavailable.",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Stay updated with the latest news</CardDescription>
        </div>
        <Megaphone className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{announcement.title}</h3>
                <span className="text-xs text-muted-foreground">{announcement.date}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{announcement.content}</p>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            View All Announcements
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
