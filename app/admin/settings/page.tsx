"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your system settings and preferences.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Basic information about your system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution-name">Institution Name</Label>
                  <Input id="institution-name" defaultValue="University of Example" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://www.example.edu" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" defaultValue="admin@example.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@example.edu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc-5">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">UTC-8 (Pacific Time)</SelectItem>
                    <SelectItem value="utc-7">UTC-7 (Mountain Time)</SelectItem>
                    <SelectItem value="utc-6">UTC-6 (Central Time)</SelectItem>
                    <SelectItem value="utc-5">UTC-5 (Eastern Time)</SelectItem>
                    <SelectItem value="utc-4">UTC-4 (Atlantic Time)</SelectItem>
                    <SelectItem value="utc">UTC (Universal Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Calendar</CardTitle>
              <CardDescription>Configure your academic calendar settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-semester">Current Semester</Label>
                  <Select defaultValue="fall2023">
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall2023">Fall 2023</SelectItem>
                      <SelectItem value="spring2024">Spring 2024</SelectItem>
                      <SelectItem value="summer2024">Summer 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-year">Current Academic Year</Label>
                  <Select defaultValue="2023-2024">
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023-2024</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester-start">Semester Start Date</Label>
                  <Input id="semester-start" type="date" defaultValue="2023-09-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester-end">Semester End Date</Label>
                  <Input id="semester-end" type="date" defaultValue="2023-12-15" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
              <CardDescription>Configure course registration settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-start">Registration Start Date</Label>
                  <Input id="reg-start" type="date" defaultValue="2023-08-15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-end">Registration End Date</Label>
                  <Input id="reg-end" type="date" defaultValue="2023-09-15" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late-reg-start">Late Registration Start Date</Label>
                  <Input id="late-reg-start" type="date" defaultValue="2023-09-16" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late-reg-end">Late Registration End Date</Label>
                  <Input id="late-reg-end" type="date" defaultValue="2023-09-22" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-courses">Maximum Courses Per Student</Label>
                <Input id="max-courses" type="number" min="1" defaultValue="6" />
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-approve" className="text-base">
                      Auto-Approve Registrations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve course registrations if prerequisites are met.
                    </p>
                  </div>
                  <Switch id="auto-approve" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="waitlist" className="text-base">
                      Enable Waitlists
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow students to join waitlists for full courses.</p>
                  </div>
                  <Switch id="waitlist" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prereq-check" className="text-base">
                      Prerequisite Checking
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce prerequisite requirements during registration.
                    </p>
                  </div>
                  <Switch id="prereq-check" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notification settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email.</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-notifications" className="text-base">
                      System Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Show notifications in the system dashboard.</p>
                  </div>
                  <Switch id="system-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration-notifications" className="text-base">
                      Registration Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Send notifications for registration status changes.</p>
                  </div>
                  <Switch id="registration-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-reminders" className="text-base">
                      Deadline Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">Send reminders for upcoming deadlines.</p>
                  </div>
                  <Switch id="deadline-reminders" defaultChecked />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Reminder Days Before Deadline</Label>
                <Input id="reminder-days" type="number" min="1" defaultValue="7" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure system security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for admin accounts.
                    </p>
                  </div>
                  <Switch id="two-factor" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-expiry" className="text-base">
                      Password Expiry
                    </Label>
                    <p className="text-sm text-muted-foreground">Require password changes periodically.</p>
                  </div>
                  <Switch id="password-expiry" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout" className="text-base">
                      Session Timeout
                    </Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users.</p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password-days">Password Expiry Days</Label>
                  <Input id="password-days" type="number" min="1" defaultValue="90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-minutes">Session Timeout (minutes)</Label>
                  <Input id="session-minutes" type="number" min="1" defaultValue="30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-password-length">Minimum Password Length</Label>
                <Input id="min-password-length" type="number" min="8" defaultValue="12" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

