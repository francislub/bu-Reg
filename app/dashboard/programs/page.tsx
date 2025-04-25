import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getAllPrograms } from "@/lib/actions/program-actions"
import { getAllDepartments } from "@/lib/actions/department-actions"
import { ProgramsClient } from "@/components/dashboard/programs-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Programs",
  description: "Manage academic programs",
}

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  try {
    // Fetch all programs and departments
    const programsResult = await getAllPrograms()
    const departmentsResult = await getAllDepartments()

    if (!programsResult.success || !departmentsResult.success) {
      throw new Error("Failed to fetch data")
    }

    return (
      <DashboardShell>
        <DashboardHeader
          heading="Academic Programs"
          text="View and manage academic programs offered by the university."
        />
        <ProgramsClient
          programs={programsResult.programs}
          departments={departmentsResult.departments}
          isRegistrar={session.user.role === "REGISTRAR" || session.user.role === "ADMIN"}
        />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error loading programs page:", error)
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Academic Programs"
          text="View and manage academic programs offered by the university."
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>There was an error loading the programs. Please try again later.</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}
