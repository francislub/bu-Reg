"use client"

import { useEffect, useState } from "react"
import { Bell, Info } from "lucide-react"

export function NotificationList() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setTimeout(() => {
          setNotifications([
            {
              id: "1",
              title: "Registration Deadline",
              message: "Course registration for Fall 2023 closes on September 15, 2023.",
              date: "2023-09-01T10:00:00Z",
            },
            {
              id: "2",
              title: "Fee Payment Reminder",
              message: "Please complete your fee payment before the deadline to avoid late charges.",
              date: "2023-08-28T14:30:00Z",
            },
            {
              id: "3",
              title: "New Course Added",
              message: "A new elective course CS450: AI and Machine Learning has been added.",
              date: "2023-08-25T09:15:00Z",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading notifications...</div>
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Bell className="h-8 w-8 mb-2" />
        <p>No new notifications</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="flex gap-3 pb-3 border-b last:border-0">
          <div className="mt-0.5">
            <Info className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{new Date(notification.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

