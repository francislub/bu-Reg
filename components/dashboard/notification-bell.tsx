"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUnreadNotificationsCount, markNotificationAsRead } from "@/lib/actions/notification-actions"

export function NotificationBell() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        // Get unread count
        const countResult = await getUnreadNotificationsCount(session.user.id)
        if (countResult.success) {
          setUnreadCount(countResult.count)
        }

        // Get recent notifications
        const response = await fetch(`/api/notifications?limit=5`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setNotifications(data.notifications)
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [session])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId)
      if (result.success) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification,
          ),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && <Badge variant="outline">{unreadCount} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="py-2 px-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-2 px-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 ${notification.isRead ? "" : "bg-muted/50"}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className="flex w-full justify-between">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{notification.message}</p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/notifications" className="w-full text-center">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
