import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSemesterById } from "@/lib/actions/semester-actions"
import { getAllCourses } from "@/lib/actions/course-actions"
import { formatDate } from "@/lib/utils"
import { SemesterCoursesClient } from "@/components/dashboard/semester-courses-client"

export default async function SemesterCoursesPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to manage semester courses
  const { user } = session
  if (user.role !== "REGISTRAR") {
    redirect("/dashboard")
  }

  const { success, semester, message } = await getSemesterById(params.id)

  if (!success || !semester) {
    notFound()
  }

  const { success: coursesSuccess, courses } = await getAllCourses()

  // Extract courses already in the semester
  const semesterCourseIds = semester.semesterCourses.map((sc) => sc.course.id)

  // Filter out courses that are already in the semester
  const availableCourses =
    coursesSuccess && courses ? courses.filter((course) => !semesterCourseIds.includes(course.id)) : []

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Manage Courses for ${semester.name}`}
        text={`Add or remove courses for the ${semester.name} semester of ${semester.academicYear.name}.`}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Semester Information</CardTitle>
            <CardDescription>Details about the semester.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium">Name</h3>
                <p className="text-muted-foreground">{semester.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Academic Year</h3>
                <p className="text-muted-foreground">{semester.academicYear.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                <p className="text-muted-foreground">
                  {semester.isActive ? <span className="text-green-600 font-medium">Active</span> : "Inactive"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Date Range</h3>
                <p className="text-muted-foreground">
                  {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <SemesterCoursesClient
          semesterId={semester.id}
          semesterCourses={semester.semesterCourses.map((sc) => sc.course)}
          availableCourses={availableCourses}
        />
      </div>
    </DashboardShell>
  )
}
