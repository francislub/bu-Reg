import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import ClientRegistrationPage from "@/components/dashboard/client-registration-page"
import { getActiveSemester } from "@/lib/actions/semester-actions"
import { getStudentRegistration } from "@/lib/actions/registration-actions"
import { getAllCourses } from "@/lib/actions/course-actions"
import { getUserProfile } from "@/lib/actions/user-actions"
import { getCoursesByProgramAndDepartment } from "@/lib/actions/program-actions"

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

  // Get user profile to determine program and department
  const userProfileResult = await getUserProfile(session.user.id)
  const userProfile = userProfileResult.success ? userProfileResult.user : null

  // Get courses based on user's program and department if available
  let availableCourses = []
  if (userProfile?.profile?.programId && userProfile?.profile?.departmentId) {
    const coursesResult = await getCoursesByProgramAndDepartment(
      userProfile.profile.programId,
      userProfile.profile.departmentId,
    )
    if (coursesResult.success) {
      availableCourses = coursesResult.courses
    }
  } else {
    // Fallback to all courses if program/department not set
    const coursesResult = await getAllCourses()
    availableCourses = coursesResult.success ? coursesResult.courses : []
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Course Registration" text="Register for courses for the current semester." />
      <ClientRegistrationPage initialRegistration={registration} availableCourses={availableCourses} />
    </DashboardShell>
  )
}
