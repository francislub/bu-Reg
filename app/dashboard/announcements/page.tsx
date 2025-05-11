import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { AnnouncementsPage } from "./AnnouncementClientPage"
import { AnnouncementsSkeleton } from "./AnnouncementClientPage"

export const metadata = {
  title: "Announcements | University Portal",
  description: "View and manage university announcements",
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
