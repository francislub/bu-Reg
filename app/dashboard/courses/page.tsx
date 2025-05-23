import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import CoursesClient from "@/components/dashboard/courses-client"
import CoursesLoading from "./loading"

export const metadata: Metadata = {
  title: "Courses | Bugema University",
  description: "View and manage university courses",
}

export default function CoursesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Courses" text="View and manage all university courses" />
      <div className="space-y-6">
        <Suspense fallback={<CoursesLoading />}>
          <CoursesClient />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
