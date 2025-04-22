import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TimetableView } from "@/components/dashboard/timetable-view"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Printer } from "lucide-react"
import Link from "next/link"

export default async function TimetablePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Get active semester
  const activeSemester = await db.semester.findFirst({
    where: { isActive: true },
  })

  if (!activeSemester) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Class Timetable" text="View your class schedule for the current semester." />
        <Card className="border-warning/20">
          <CardHeader className="bg-warning/5">
            <CardTitle className="text-warning flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              No Active Semester
            </CardTitle>
            <CardDescription>There is no active semester at the moment. Please check back later.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    )
  }

  // Get user's registered courses for the active semester
  const registration = await db.registration.findFirst({
    where: {
      userId: session.user.id,
      semesterId: activeSemester.id,
    },
    include: {
      courseUploads: {
        where: {
          status: "APPROVED",
        },
        include: {
          course: true,
        },
      },
    },
  })

  // Get timetable for the active semester
  const timetable = await db.timetable.findFirst({
    where: {
      semesterId: activeSemester.id,
      isPublished: true,
    },
    include: {
      slots: {
        include: {
          course: true,
        },
      },
    },
  })

  // Filter timetable slots to only include user's registered courses
  const userCourseIds = registration?.courseUploads.map((upload) => upload.courseId) || []
  const filteredSlots = timetable?.slots.filter((slot) => userCourseIds.includes(slot.courseId)) || []

  return (
    <DashboardShell>
      <DashboardHeader heading="Class Timetable" text="View your class schedule for the current semester.">
        <Link href="/dashboard/timetable/print">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Printer className="h-3.5 w-3.5" />
            <span>Print Timetable</span>
          </Button>
        </Link>
      </DashboardHeader>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="space-y-4">
          <TimetableView slots={filteredSlots} semester={activeSemester} viewType="weekly" />
        </TabsContent>
        <TabsContent value="daily" className="space-y-4">
          <TimetableView slots={filteredSlots} semester={activeSemester} viewType="daily" />
        </TabsContent>
        <TabsContent value="list" className="space-y-4">
          <TimetableView slots={filteredSlots} semester={activeSemester} viewType="list" />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
