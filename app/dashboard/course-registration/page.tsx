import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText } from "lucide-react"
import Link from "next/link"
import { CourseRegistrationForm } from "@/components/dashboard/course-registration-form"

export default async function CourseRegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Get active semester
  const activeSemester = await db.semester.findFirst({
    where: { isActive: true },
  })

  if (!activeSemester) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Course Registration" text="Register for courses in the current semester." />
        <Card className="border-warning/20">
          <CardHeader className="bg-warning/5">
            <CardTitle className="text-warning flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              No Active Semester
            </CardTitle>
            <CardDescription>There is no active semester at the moment. Please check back later.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    )
  }

  // Check if registration deadline has passed
  const isRegistrationOpen = activeSemester.registrationDeadline
    ? new Date() < new Date(activeSemester.registrationDeadline)
    : true

  // Get user's registration for the active semester
  const registration = await db.registration.findFirst({
    where: {
      userId: session.user.id,
      semesterId: activeSemester.id,
    },
    include: {
      courseUploads: {
        include: {
          course: true,
          approvals: {
            include: {
              approver: true,
            },
          },
        },
      },
    },
  })

  // Get available courses for the semester
  const semesterCourses = await db.semesterCourse.findMany({
    where: {
      semesterId: activeSemester.id,
    },
    include: {
      course: {
        include: {
          department: true,
        },
      },
    },
  })

  // Group courses by department
  const coursesByDepartment = semesterCourses.reduce(
    (acc, sc) => {
      const deptName = sc.course.department.name
      if (!acc[deptName]) {
        acc[deptName] = []
      }
      acc[deptName].push(sc.course)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Course Registration"
        text="Register for courses for the current semester. Maximum 24 credit units allowed."
      >
        {registration && (
          <Link href="/dashboard/registration/card">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>Registration Card</span>
            </Button>
          </Link>
        )}
      </DashboardHeader>

      <div className="grid gap-8">
        <CourseRegistrationForm />
      </div>
    </DashboardShell>
  )
}
