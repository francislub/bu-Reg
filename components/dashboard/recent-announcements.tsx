"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  category?: string
  createdAt: string
  important?: boolean
}

interface RecentAnnouncementsProps {
  announcements?: Announcement[]
}

export function RecentAnnouncements({ announcements: initialAnnouncements }: RecentAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements || [])
  const [isLoading, setIsLoading] = useState(!initialAnnouncements)

  useEffect(() => {
    if (initialAnnouncements) {
      setAnnouncements(initialAnnouncements)
      setIsLoading(false)
      return
    }

    async function fetchAnnouncements() {
      try {
        const response = await fetch("/api/announcements")
        const data = await response.json()

        if (data.success) {
          setAnnouncements(data.announcements)
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [initialAnnouncements])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bell className="h-5 w-5" />
          Recent Announcements
        </CardTitle>
        <CardDescription>Stay updated with the latest university announcements</CardDescription>
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
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-primary">{announcement.title}</h3>
                  <div className="flex items-center gap-2">
                    {announcement.important && <Badge variant="destructive">Important</Badge>}
                    {announcement.category && (
                      <Badge variant="outline" className="bg-primary/10">
                        {announcement.category}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No announcements at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
