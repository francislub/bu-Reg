import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getProgramById } from "@/lib/actions/program-actions"
import { getAllCourses } from "@/lib/actions/course-actions"
import { ProgramDetailClient } from "@/components/dashboard/program-details-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Program Details",
  description: "View and manage program details",
}

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  try {
    // Fetch program details
    const programResult = await getProgramById(params.id)

    if (!programResult.success) {
      return notFound()
    }

    // Fetch all courses for adding to program
    const coursesResult = await getAllCourses()

    return (
      <DashboardShell>
        <DashboardHeader
          heading={programResult.program.name}
          text={`${programResult.program.code} - ${programResult.program.department.name}`}
        />
        <ProgramDetailClient
          program={programResult.program}
          allCourses={coursesResult.success ? coursesResult.courses : []}
          isRegistrar={session.user.role === "REGISTRAR" || session.user.role === "ADMIN"}
        />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error loading program details:", error)
    return (
      <DashboardShell>
        <DashboardHeader heading="Program Details" text="View and manage program details" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>There was an error loading the program details. Please try again later.</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}
