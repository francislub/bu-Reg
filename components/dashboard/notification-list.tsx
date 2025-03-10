"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  date: string
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications([
        {
          id: "1",
          title: "Registration Closure",
          message:
            "Please be informed that the registrar's office will be closing registration for sem 2 2022-2023 on the 10th of March (Friday).",
          date: "2023-03-01",
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
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No notifications yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="border rounded-md p-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{notification.title}</h4>
            <span className="text-xs text-gray-500">{new Date(notification.date).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full">
        View All Notifications
      </Button>
    </div>
  )
}

