import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getAllSemesters } from "@/lib/actions/semester-actions"
import { getAllAcademicYears } from "@/lib/actions/academic-year-actions"
import { SemestersClient } from "@/components/dashboard/semesters-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Semesters",
  description: "Manage academic semesters",
}

export default async function SemestersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to manage semesters
  const isAuthorized = session.user.role === "REGISTRAR" || session.user.role === "ADMIN"

  try {
    // Fetch all semesters and academic years
    const semestersResult = await getAllSemesters()
    const academicYearsResult = await getAllAcademicYears()

    if (!semestersResult.success || !academicYearsResult.success) {
      throw new Error("Failed to fetch data")
    }

    return (
      <DashboardShell>
        <DashboardHeader heading="Academic Semesters" text="View and manage academic semesters for the university." />
        <SemestersClient
          semesters={semestersResult.semesters}
          academicYears={academicYearsResult.academicYears}
          isRegistrar={isAuthorized}
        />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error loading semesters page:", error)
    return (
      <DashboardShell>
        <DashboardHeader heading="Academic Semesters" text="View and manage academic semesters for the university." />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>There was an error loading the semesters. Please try again later.</AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }
}
