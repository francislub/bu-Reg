"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, CheckCircle, Loader2, Trash2, Info, AlertTriangle, AlertCircle } from "lucide-react"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/actions/notification-actions"

export default function NotificationsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isMarkingRead, setIsMarkingRead] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const result = await getUserNotifications(session.user.id)
        if (result.success) {
          setNotifications(result.notifications)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch notifications",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [session, toast])

  const handleMarkAsRead = async (notificationId: string) => {
    setIsMarkingRead((prev) => ({ ...prev, [notificationId]: true }))
    try {
      const result = await markNotificationAsRead(notificationId)
      if (result.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification,
          ),
        )
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to mark notification as read",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMarkingRead((prev) => ({ ...prev, [notificationId]: false }))
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return

    try {
      const result = await markAllNotificationsAsRead(session.user.id)
      if (result.success) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
        toast({
          title: "Success",
          description: "All notifications marked as read",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to mark all notifications as read",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    setIsDeleting((prev) => ({ ...prev, [notificationId]: true }))
    try {
      const result = await deleteNotification(notificationId)
      if (result.success) {
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
        toast({
          title: "Success",
          description: "Notification deleted",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete notification",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting((prev) => ({ ...prev, [notificationId]: false }))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "ERROR":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "INFO":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const unreadNotifications = notifications.filter((notification) => !notification.isRead)
  const readNotifications = notifications.filter((notification) => notification.isRead)

  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="View and manage your notifications">
        {unreadNotifications.length > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Notifications</h3>
                <p className="text-muted-foreground mt-2">You don't have any notifications at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="unread" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unread" className="flex items-center gap-2">
                  Unread <Badge variant="outline">{unreadNotifications.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All <Badge variant="outline">{notifications.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unread" className="mt-6">
                {unreadNotifications.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-lg font-medium">All Caught Up!</h3>
                      <p className="text-muted-foreground mt-2">You have no unread notifications.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {unreadNotifications.map((notification) => (
                      <Card key={notification.id} className={notification.isRead ? "bg-muted/30" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getNotificationIcon(notification.type)}
                              <CardTitle className="text-base">{notification.title}</CardTitle>
                            </div>
                            <Badge variant="outline">{new Date(notification.createdAt).toLocaleDateString()}</Badge>
                          </div>
                          <CardDescription>{new Date(notification.createdAt).toLocaleTimeString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{notification.message}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            disabled={isDeleting[notification.id]}
                          >
                            {isDeleting[notification.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isMarkingRead[notification.id]}
                          >
                            {isMarkingRead[notification.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Mark as Read
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className={notification.isRead ? "bg-muted/30" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(notification.type)}
                            <CardTitle className="text-base">{notification.title}</CardTitle>
                          </div>
                          <Badge variant="outline">{new Date(notification.createdAt).toLocaleDateString()}</Badge>
                        </div>
                        <CardDescription>{new Date(notification.createdAt).toLocaleTimeString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{notification.message}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          disabled={isDeleting[notification.id]}
                        >
                          {isDeleting[notification.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isMarkingRead[notification.id]}
                          >
                            {isMarkingRead[notification.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Mark as Read
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
