import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { AnnouncementsPage } from "./AnnouncementClientPage"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Announcements | University Portal",
  description: "View and manage university announcements",
}

// Create a proper AnnouncementsSkeleton component
function AnnouncementsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}

async function getAnnouncements() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return announcements
  } catch (error) {
    console.error("Failed to fetch announcements:", error)
    return []
  }
}

export default async function AnnouncementsRoute() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const announcements = await getAnnouncements()

  return (
    <Suspense fallback={<AnnouncementsSkeleton />}>
      <AnnouncementsPage announcements={announcements} />
    </Suspense>
  )
}
