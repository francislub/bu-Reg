"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [settings, setSettings] = useState({
    general: {
      institutionName: "",
      website: "",
      adminEmail: "",
      supportEmail: "",
      timezone: "utc-5",
    },
    academic: {
      currentSemester: "fall2023",
      currentAcademicYear: "2023-2024",
      semesterStartDate: "",
      semesterEndDate: "",
    },
    registration: {
      registrationStartDate: "",
      registrationEndDate: "",
      lateRegistrationStartDate: "",
      lateRegistrationEndDate: "",
      maxCoursesPerStudent: 6,
      autoApproveRegistrations: true,
      enableWaitlists: true,
      prerequisiteChecking: true,
    },
    notifications: {
      emailNotifications: true,
      systemNotifications: true,
      registrationNotifications: true,
      deadlineReminders: true,
      reminderDays: 7,
    },
    security: {
      twoFactorAuthentication: true,
      passwordExpiry: true,
      sessionTimeout: true,
      passwordExpiryDays: 90,
      sessionTimeoutMinutes: 30,
      minPasswordLength: 12,
    },
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsFetching(true)
      const res = await fetch("/api/settings")

      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleSwitchChange = (section, field) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field],
      },
    }))
  }

  const handleSave = async (section) => {
    try {
      setIsLoading(true)

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          data: settings[section],
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
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
                  <Input
                    id="institution-name"
                    value={settings.general.institutionName}
                    onChange={(e) => handleInputChange("general", "institutionName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.general.website}
                    onChange={(e) => handleInputChange("general", "website", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    value={settings.general.adminEmail}
                    onChange={(e) => handleInputChange("general", "adminEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleInputChange("general", "supportEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) => handleInputChange("general", "timezone", value)}
                >
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
              <Button onClick={() => handleSave("general")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
                  <Select
                    value={settings.academic.currentSemester}
                    onValueChange={(value) => handleInputChange("academic", "currentSemester", value)}
                  >
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
                  <Select
                    value={settings.academic.currentAcademicYear}
                    onValueChange={(value) => handleInputChange("academic", "currentAcademicYear", value)}
                  >
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
                  <Input
                    id="semester-start"
                    type="date"
                    value={settings.academic.semesterStartDate}
                    onChange={(e) => handleInputChange("academic", "semesterStartDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester-end">Semester End Date</Label>
                  <Input
                    id="semester-end"
                    type="date"
                    value={settings.academic.semesterEndDate}
                    onChange={(e) => handleInputChange("academic", "semesterEndDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("academic")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
                  <Input
                    id="reg-start"
                    type="date"
                    value={settings.registration.registrationStartDate}
                    onChange={(e) => handleInputChange("registration", "registrationStartDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-end">Registration End Date</Label>
                  <Input
                    id="reg-end"
                    type="date"
                    value={settings.registration.registrationEndDate}
                    onChange={(e) => handleInputChange("registration", "registrationEndDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late-reg-start">Late Registration Start Date</Label>
                  <Input
                    id="late-reg-start"
                    type="date"
                    value={settings.registration.lateRegistrationStartDate}
                    onChange={(e) => handleInputChange("registration", "lateRegistrationStartDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late-reg-end">Late Registration End Date</Label>
                  <Input
                    id="late-reg-end"
                    type="date"
                    value={settings.registration.lateRegistrationEndDate}
                    onChange={(e) => handleInputChange("registration", "lateRegistrationEndDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-courses">Maximum Courses Per Student</Label>
                <Input
                  id="max-courses"
                  type="number"
                  min="1"
                  value={settings.registration.maxCoursesPerStudent}
                  onChange={(e) =>
                    handleInputChange("registration", "maxCoursesPerStudent", Number.parseInt(e.target.value))
                  }
                />
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
                  <Switch
                    id="auto-approve"
                    checked={settings.registration.autoApproveRegistrations}
                    onCheckedChange={() => handleSwitchChange("registration", "autoApproveRegistrations")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="waitlist" className="text-base">
                      Enable Waitlists
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow students to join waitlists for full courses.</p>
                  </div>
                  <Switch
                    id="waitlist"
                    checked={settings.registration.enableWaitlists}
                    onCheckedChange={() => handleSwitchChange("registration", "enableWaitlists")}
                  />
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
                  <Switch
                    id="prereq-check"
                    checked={settings.registration.prerequisiteChecking}
                    onCheckedChange={() => handleSwitchChange("registration", "prerequisiteChecking")}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("registration")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={() => handleSwitchChange("notifications", "emailNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-notifications" className="text-base">
                      System Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Show notifications in the system dashboard.</p>
                  </div>
                  <Switch
                    id="system-notifications"
                    checked={settings.notifications.systemNotifications}
                    onCheckedChange={() => handleSwitchChange("notifications", "systemNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration-notifications" className="text-base">
                      Registration Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Send notifications for registration status changes.</p>
                  </div>
                  <Switch
                    id="registration-notifications"
                    checked={settings.notifications.registrationNotifications}
                    onCheckedChange={() => handleSwitchChange("notifications", "registrationNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-reminders" className="text-base">
                      Deadline Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">Send reminders for upcoming deadlines.</p>
                  </div>
                  <Switch
                    id="deadline-reminders"
                    checked={settings.notifications.deadlineReminders}
                    onCheckedChange={() => handleSwitchChange("notifications", "deadlineReminders")}
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Reminder Days Before Deadline</Label>
                <Input
                  id="reminder-days"
                  type="number"
                  min="1"
                  value={settings.notifications.reminderDays}
                  onChange={(e) => handleInputChange("notifications", "reminderDays", Number.parseInt(e.target.value))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("notifications")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
                  <Switch
                    id="two-factor"
                    checked={settings.security.twoFactorAuthentication}
                    onCheckedChange={() => handleSwitchChange("security", "twoFactorAuthentication")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-expiry" className="text-base">
                      Password Expiry
                    </Label>
                    <p className="text-sm text-muted-foreground">Require password changes periodically.</p>
                  </div>
                  <Switch
                    id="password-expiry"
                    checked={settings.security.passwordExpiry}
                    onCheckedChange={() => handleSwitchChange("security", "passwordExpiry")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout" className="text-base">
                      Session Timeout
                    </Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users.</p>
                  </div>
                  <Switch
                    id="session-timeout"
                    checked={settings.security.sessionTimeout}
                    onCheckedChange={() => handleSwitchChange("security", "sessionTimeout")}
                  />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password-days">Password Expiry Days</Label>
                  <Input
                    id="password-days"
                    type="number"
                    min="1"
                    value={settings.security.passwordExpiryDays}
                    onChange={(e) =>
                      handleInputChange("security", "passwordExpiryDays", Number.parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-minutes">Session Timeout (minutes)</Label>
                  <Input
                    id="session-minutes"
                    type="number"
                    min="1"
                    value={settings.security.sessionTimeoutMinutes}
                    onChange={(e) =>
                      handleInputChange("security", "sessionTimeoutMinutes", Number.parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-password-length">Minimum Password Length</Label>
                <Input
                  id="min-password-length"
                  type="number"
                  min="8"
                  value={settings.security.minPasswordLength}
                  onChange={(e) => handleInputChange("security", "minPasswordLength", Number.parseInt(e.target.value))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave("security")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

