"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ChevronRight, AlertCircle } from "lucide-react"
import { format } from "date-fns"

type Announcement = {
  id: string
  title: string
  content: string
  createdAt: string
  author?: {
    name: string
  } | null
}

export function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/announcements?limit=3")
        const data = await response.json()

        if (data.success) {
          setAnnouncements(data.announcements)
          setError(null)
        } else {
          setError(data.message || "Failed to fetch announcements")
          toast({
            title: "Error",
            description: data.message || "Failed to fetch announcements",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Announcements</CardTitle>
        <CardDescription>Latest announcements from the university</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center mt-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : announcements.length > 0 ? (
          // Announcements list
          announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-lg border p-4 transition-all duration-200 hover:bg-muted/50">
              <h3 className="font-semibold text-foreground transition-colors hover:text-primary">
                {announcement.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{truncateContent(announcement.content)}</p>
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-muted-foreground">
                  {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                </div>
                {announcement.author && (
                  <span className="text-xs text-muted-foreground">By: {announcement.author.name}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <p className="text-muted-foreground">No announcements available</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/dashboard/announcements">
            View All Announcements
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
