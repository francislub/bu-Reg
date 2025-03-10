"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, CheckCircle, Clock, User, XCircle } from "lucide-react"

interface Activity {
  id: string
  type: "registration" | "approval" | "rejection" | "login" | "course_added"
  description: string
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities([
        {
          id: "1",
          type: "approval",
          description: "Admin approved John Doe's registration for CSC101",
          timestamp: "2023-09-05T10:30:00Z",
        },
        {
          id: "2",
          type: "registration",
          description: "Jane Smith registered for MAT101",
          timestamp: "2023-09-05T09:45:00Z",
        },
        {
          id: "3",
          type: "course_added",
          description: "New course ENG202 added by Admin",
          timestamp: "2023-09-04T14:20:00Z",
        },
        {
          id: "4",
          type: "login",
          description: "Admin logged in",
          timestamp: "2023-09-04T08:10:00Z",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "registration":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejection":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "login":
        return <User className="h-4 w-4 text-blue-500" />
      case "course_added":
        return <BookOpen className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
          <div>
            <p className="text-sm">{activity.description}</p>
            <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

