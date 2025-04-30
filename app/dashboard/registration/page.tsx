import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import ClientRegistrationPage from "@/components/dashboard/client-registration-page"
import { getActiveSemester } from "@/lib/actions/semester-actions"
import { getStudentRegistration } from "@/lib/actions/registration-actions"
import { getAllCourses } from "@/lib/actions/course-actions"

export const metadata = {
  title: "Course Registration",
  description: "Register for courses for the upcoming semester",
}

export default async function RegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  // Only students can register for courses
  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Get active semester
  const semesterResult = await getActiveSemester()
  const activeSemester = semesterResult.success ? semesterResult.semester : null

  // Get student registration if active semester exists
  let registration = null
  if (activeSemester && session.user.id) {
    const registrationResult = await getStudentRegistration(session.user.id, activeSemester.id)
    if (registrationResult.success) {
      registration = registrationResult.registration
    }
  }

  // Get all available courses
  const coursesResult = await getAllCourses()
  const availableCourses = coursesResult.success ? coursesResult.courses : []

  return (
    <DashboardShell>
      <DashboardHeader heading="Course Registration" text="Register for courses for the current semester." />
      <ClientRegistrationPage initialRegistration={registration} availableCourses={availableCourses} />
    </DashboardShell>
  )
}
