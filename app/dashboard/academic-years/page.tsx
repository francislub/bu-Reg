import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllAcademicYears } from "@/lib/actions/academic-year-actions"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Calendar, School } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Academic Years | Bugema University",
  description: "Manage academic years",
}

export default async function AcademicYearsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to view academic years
  const { user } = session
  if (user.role !== "REGISTRAR") {
    redirect("/dashboard")
  }

  const { success, academicYears, message } = await getAllAcademicYears()

  return (
    <DashboardShell>
      <DashboardHeader heading="Academic Years" text="Manage academic years for the university.">
        <Button asChild>
          <Link href="/dashboard/academic-years/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Academic Year
          </Link>
        </Button>
      </DashboardHeader>

      {!success ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium">Error</h3>
              <p className="text-muted-foreground mt-2">{message || "Failed to load academic years"}</p>
            </div>
          </CardContent>
        </Card>
      ) : academicYears && academicYears.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {academicYears.map((academicYear) => (
            <Card key={academicYear.id} className={academicYear.isActive ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{academicYear.name}</CardTitle>
                  {academicYear.isActive && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Active</span>
                  )}
                </div>
                <CardDescription>
                  {formatDate(academicYear.startDate)} - {formatDate(academicYear.endDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{academicYear.semesters?.length || 0} Semesters</span>
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/academic-years/${academicYear.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/academic-years/${academicYear.id}/semesters`}>
                      <School className="mr-2 h-4 w-4" />
                      Manage Semesters
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium">No Academic Years</h3>
              <p className="text-muted-foreground mt-2">
                There are no academic years yet. Click the button above to add one.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}
