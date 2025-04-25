import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAcademicYearById } from "@/lib/actions/academic-year-actions"
import { getSemestersByAcademicYear } from "@/lib/actions/semester-actions"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Calendar, Edit } from "lucide-react"

export default async function AcademicYearDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to view academic years
  const { user } = session
  if (user.role !== "REGISTRAR") {
    redirect("/dashboard")
  }

  const { success, academicYear, message } = await getAcademicYearById(params.id)

  if (!success || !academicYear) {
    notFound()
  }

  const { success: semestersSuccess, semesters } = await getSemestersByAcademicYear(params.id)

  return (
    <DashboardShell>
      <DashboardHeader heading={academicYear.name} text="Academic year details and management.">
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/academic-years/${academicYear.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/academic-years/${academicYear.id}/semesters/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Semester
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic Year Information</CardTitle>
            <CardDescription>Details about the academic year.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium">Name</h3>
                <p className="text-muted-foreground">{academicYear.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                <p className="text-muted-foreground">
                  {academicYear.isActive ? <span className="text-green-600 font-medium">Active</span> : "Inactive"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Start Date</h3>
                <p className="text-muted-foreground">{formatDate(academicYear.startDate)}</p>
              </div>
              <div>
                <h3 className="font-medium">End Date</h3>
                <p className="text-muted-foreground">{formatDate(academicYear.endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Semesters</CardTitle>
              <CardDescription>Semesters in this academic year.</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/dashboard/academic-years/${academicYear.id}/semesters/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Semester
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {semestersSuccess && semesters && semesters.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {semesters.map((semester) => (
                  <Card key={semester.id} className={semester.isActive ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{semester.name}</CardTitle>
                        {semester.isActive && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{semester.semesterCourses?.length || 0} Courses</span>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/semesters/${semester.id}`}>View Details</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/semesters/${semester.id}/courses`}>Manage Courses</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium">No Semesters</h3>
                <p className="text-muted-foreground mt-2">
                  There are no semesters in this academic year yet. Click the button above to add one.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
