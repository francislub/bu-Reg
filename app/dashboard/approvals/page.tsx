import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApprovalsClient } from "@/components/dashboard/approvals-client"
import { getAllPendingRegistrations } from "@/lib/actions/registration-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Course Approvals",
  description: "Manage student course registration approvals",
}

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to view approvals
  const { user } = session
  if (user.role !== "REGISTRAR" && user.role !== "ADMIN" && user.role !== "STAFF") {
    redirect("/dashboard/approvals")
  }

  try {
    // Fetch all pending registrations
    const pendingRegistrations = await getAllPendingRegistrations()

    // Format the data for the client component
    const formattedRegistrations = pendingRegistrations.map((reg) => ({
      id: reg.id,
      studentId: reg.student.id,
      studentName:
        `${reg.student.profile?.firstName || ""} ${reg.student.profile?.lastName || ""}`.trim() ||
        reg.student.name ||
        "Unknown Student",
      courseId: reg.course.id,
      courseName: reg.course.title,
      courseCode: reg.course.code,
      status: reg.status,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt,
      semesterId: reg.semester.id,
      semesterName: reg.semester.name,
    }))

    return (
      <DashboardShell>
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Course Approvals</h2>
              <p className="text-muted-foreground">Review and manage student course registration requests</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formattedRegistrations.filter((r) => r.status === "PENDING").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formattedRegistrations.filter((r) => r.status === "APPROVED").length}
                </div>
                <p className="text-xs text-muted-foreground">Registrations approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formattedRegistrations.filter((r) => r.status === "REJECTED").length}
                </div>
                <p className="text-xs text-muted-foreground">Registrations rejected</p>
              </CardContent>
            </Card>
          </div>

          {formattedRegistrations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No registrations found</AlertTitle>
              <AlertDescription>
                There are currently no course registrations that require your approval.
              </AlertDescription>
            </Alert>
          ) : (
            <ApprovalsClient pendingRegistrations={formattedRegistrations} />
          )}
        </div>
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error fetching approvals:", error)
    return (
      <DashboardShell>
        <div className="flex h-full items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>There was an error loading approvals. Please try again later.</AlertDescription>
          </Alert>
        </div>
      </DashboardShell>
    )
  }
}
