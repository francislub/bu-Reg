import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getActiveSemester, getAvailableCourses } from "@/lib/data-fetching"
import { userRoles } from "@/lib/utils"
import { CourseRegistrationForm } from "@/components/dashboard/course-registration-form"

export default async function RegisterCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== userRoles.STUDENT) {
    redirect("/dashboard")
  }

  const activeSemester = await getActiveSemester()
  const availableCourses = await getAvailableCourses()

  if (!activeSemester) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Registration</h2>
          <p className="text-muted-foreground">Register for courses for the upcoming semester</p>
        </div>

        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800">No Active Semester</h3>
          <p className="text-yellow-700 mt-2">
            There is no active semester available for registration. Please check back later or contact the registrar's
            office.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Course Registration</h2>
        <p className="text-muted-foreground">Register for courses for the upcoming semester</p>
      </div>

      <CourseRegistrationForm userId={session.user.id} semester={activeSemester} availableCourses={availableCourses} />
    </div>
  )
}
