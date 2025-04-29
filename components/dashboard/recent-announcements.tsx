"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

type Announcement = {
  id: string
  title: string
  content: string
  createdAt: string
}

export function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/announcements?limit=3")

        if (!response.ok) {
          throw new Error("Failed to fetch announcements")
        }

        const data = await response.json()

        if (data.success) {
          setAnnouncements(data.announcements)
        } else {
          setError(data.message || "Failed to fetch announcements")
        }
      } catch (err) {
        console.error("Error fetching announcements:", err)
        setError("An error occurred while fetching announcements")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Announcements</CardTitle>
        <CardDescription>Latest updates and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No announcements yet</div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="mb-4 pb-4 border-b last:border-0">
              <h3 className="font-medium text-lg">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
              </p>
              <p className="text-sm line-clamp-2">{announcement.content}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
