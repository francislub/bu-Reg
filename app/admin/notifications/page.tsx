"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Bell, Calendar, Megaphone, Info } from "lucide-react"

// Mock data
const notifications = [
  {
    id: "1",
    title: "Registration Deadline Approaching",
    message:
      "The deadline for course registration is September 15, 2023. Please complete your registration before the deadline.",
    type: "DEADLINE",
    isRead: false,
    createdAt: "2023-09-01T10:30:00Z",
  },
  {
    id: "2",
    title: "New Course Added: AI and Machine Learning",
    message:
      "A new course on AI and Machine Learning (CS450) has been added to the Fall 2023 semester. Enrollment is now open.",
    type: "ANNOUNCEMENT",
    isRead: true,
    createdAt: "2023-08-25T14:15:00Z",
  },
  {
    id: "3",
    title: "System Maintenance",
    message:
      "The course registration system will be down for maintenance on September 5, 2023, from 2:00 AM to 5:00 AM.",
    type: "SYSTEM",
    isRead: true,
    createdAt: "2023-08-20T09:45:00Z",
  },
  {
    id: "4",
    title: "Registration Approved",
    message: "Your registration for CS101: Introduction to Computer Science has been approved.",
    type: "REGISTRATION",
    isRead: false,
    createdAt: "2023-08-18T11:20:00Z",
  },
  {
    id: "5",
    title: "Faculty Office Hours Update",
    message:
      "Dr. John Smith has updated his office hours for the Fall 2023 semester. New hours: Monday and Wednesday, 2:00 PM - 4:00 PM.",
    type: "ANNOUNCEMENT",
    isRead: false,
    createdAt: "2023-08-15T13:10:00Z",
  },
]

export default function NotificationsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotifications = notifications.filter(
    (notification) =>
      activeTab === "all" ||
      (activeTab === "unread" && !notification.isRead) ||
      activeTab === notification.type.toLowerCase(),
  )

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "DEADLINE":
        return <Calendar className="h-5 w-5 text-yellow-500" />
      case "ANNOUNCEMENT":
        return <Megaphone className="h-5 w-5 text-blue-500" />
      case "SYSTEM":
        return <Info className="h-5 w-5 text-purple-500" />
      case "REGISTRATION":
        return <Bell className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Create Notification</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>Create a new notification to send to users.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Notification title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Notification message" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM">System</SelectItem>
                      <SelectItem value="REGISTRATION">Registration</SelectItem>
                      <SelectItem value="DEADLINE">Deadline</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">All Students</SelectItem>
                      <SelectItem value="faculty">All Faculty</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Notification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="deadline">Deadlines</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={notification.isRead ? "opacity-75" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                      </div>
                      {!notification.isRead && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{formatDate(notification.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.message}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="ghost" size="sm">
                      {notification.isRead ? "Mark as Unread" : "Mark as Read"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">No notifications found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

