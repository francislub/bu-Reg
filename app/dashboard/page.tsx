import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentAnnouncements } from "@/components/dashboard/recent-announcements"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Get date 30 days ago for filtering
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch user data with related information
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      registrations: {
        include: {
          semester: true,
          courseUploads: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      // Correctly query attendance records through the session relationship
      attendanceRecords: {
        include: {
          session: {
            include: {
              course: true,
            },
          },
        },
        where: {
          session: {
            date: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    },
  })

  // Check if announcement model exists in the schema
  let announcements = []
  try {
    // Fetch announcements if the model exists
    if (db.announcement) {
      announcements = await db.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })
    } else if (db.notification) {
      // Try using notification model as a fallback
      announcements = await db.notification.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })
    }
  } catch (error) {
    console.error("Error fetching announcements:", error)
    // Provide fallback data
    announcements = [
      {
        id: "1",
        title: "Welcome to the new semester",
        content: "We hope you have a great academic year ahead!",
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Registration deadline approaching",
        content: "Please complete your course registration by the end of this week.",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ]
  }

  // Check if event model exists in the schema
  let events = []
  try {
    // Fetch events if the model exists
    if (db.event) {
      events = await db.event.findMany({
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      })
    } else if (db.calendar) {
      // Try using calendar model as a fallback
      events = await db.calendar.findMany({
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      })
    }
  } catch (error) {
    console.error("Error fetching events:", error)
    // Provide fallback data
    events = [
      {
        id: "1",
        title: "Mid-term Examinations",
        description: "Mid-term examinations for all courses",
        date: new Date(Date.now() + 7 * 86400000), // 7 days from now
      },
      {
        id: "2",
        title: "Career Fair",
        description: "Annual university career fair with industry representatives",
        date: new Date(Date.now() + 14 * 86400000), // 14 days from now
      },
    ]
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Welcome, ${user?.profile?.firstName || session.user.name}`}
        text="Here's an overview of your academic progress and activities."
      />
      <div className="grid gap-6">
        <DashboardCards user={user} />
        <Suspense fallback={<ChartSkeleton />}>
          <DashboardCharts userId={session.user.id} />
        </Suspense>
        <div className="grid gap-6 md:grid-cols-2">
          <RecentAnnouncements announcements={announcements} />
          <UpcomingEvents events={events} />
        </div>
      </div>
    </DashboardShell>
  )
}

function ChartSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[300px] w-full mt-6" />
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[300px] w-full mt-6" />
      </div>
    </div>
  )
}
