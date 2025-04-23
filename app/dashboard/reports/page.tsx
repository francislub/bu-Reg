import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportsClient } from "@/components/dashboard/reports-client"

export const metadata = {
  title: "Reports",
  description: "Generate and view university reports",
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to view reports
  const { user } = session
  if (user.role !== "REGISTRAR" && user.role !== "ADMIN") {
    redirect("/dashboard/reports")
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and download reports for the university</p>
        </div>
      </div>
      <ReportsClient />
    </DashboardShell>
  )
}
