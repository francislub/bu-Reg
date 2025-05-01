"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { sendRegistrationDeadlineReminders } from "@/lib/actions/semester-actions"

export default function SendNotificationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notificationType, setNotificationType] = useState("custom")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [semesterId, setSemesterId] = useState("")
  const [semesters, setSemesters] = useState([])

  // Fetch semesters for the dropdown
  useState(() => {
    const fetchSemesters = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const response = await fetch(`${baseUrl}/api/semesters`)
        const data = await response.json()
        if (data.success) {
          setSemesters(data.semesters)
        }
      } catch (error) {
        console.error("Failed to fetch semesters:", error)
      }
    }

    fetchSemesters()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (notificationType === "deadline" && semesterId) {
        // Send registration deadline reminders
        const result = await sendRegistrationDeadlineReminders(semesterId)

        if (result.success) {
          toast({
            title: "Reminders Sent",
            description: `Successfully sent ${result.stats.success} reminders.`,
          })
          router.push("/dashboard/notifications")
          router.refresh()
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to send reminders",
            variant: "destructive",
          })
        }
      } else if (notificationType === "custom" && title && message) {
        // Send custom notification to all users
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const response = await fetch(`${baseUrl}/api/notifications/broadcast`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            message,
          }),
        })

        const data = await response.json()

        if (data.success) {
          toast({
            title: "Notification Sent",
            description: "Your notification has been sent to all users.",
          })
          router.push("/dashboard/notifications")
          router.refresh()
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to send notification",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Send Notifications</CardTitle>
          <CardDescription>Send notifications to users via email and in-app alerts</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notificationType">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger id="notificationType">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Notification</SelectItem>
                  <SelectItem value="deadline">Registration Deadline Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificationType === "deadline" ? (
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={semesterId} onValueChange={setSemesterId}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.academicYear?.year} {semester.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title"
                    required={notificationType === "custom"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your notification message here"
                    required={notificationType === "custom"}
                    rows={5}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
