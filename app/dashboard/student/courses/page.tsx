import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseRegistrationForm } from "@/components/dashboard/course-registration-form"

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login")
  }

  // Get available courses
  const courses = await prisma.course.findMany({
    where: {
      isActive: true,
      currentStudents: {
        lt: prisma.course.fields.maxStudents,
      },
    },
    orderBy: { courseCode: "asc" },
  })

  // Get student's current registrations
  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: { course: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Registration</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Select courses to register for the current semester</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseRegistrationForm courses={courses} registrations={registrations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Guidelines</CardTitle>
            <CardDescription>Important information about course registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Registration Period</h3>
              <p className="text-sm text-muted-foreground">
                The registration period for the current semester ends on March 10, 2025.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Course Limits</h3>
              <p className="text-sm text-muted-foreground">
                Students can register for a maximum of 6 courses per semester.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Prerequisites</h3>
              <p className="text-sm text-muted-foreground">
                Some courses require prerequisites. Make sure you have completed the required courses before
                registering.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Approval Process</h3>
              <p className="text-sm text-muted-foreground">
                All registrations are subject to approval by the administration. You will receive a notification once
                your registration is approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

