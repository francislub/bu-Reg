import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PrintRegistrationList } from "@/components/dashboard/print-registration-list"
import { getAllRegistrations } from "@/lib/actions/registration-actions"
import { getAllStudents } from "@/lib/actions/user-actions"
import { getActiveSemester, getAllSemesters } from "@/lib/actions/semester-actions"

export const metadata = {
  title: "Print Registration Cards",
  description: "Print registration cards for students",
}

export default async function PrintRegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  // Only registrars and admins can access this page
  if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Get active semester
  const semesterResult = await getActiveSemester()
  const activeSemester = semesterResult.success ? semesterResult.semester : null

  // Get all semesters for filtering
  const semestersResult = await getAllSemesters()
  const semesters = semestersResult.success ? semestersResult.semesters : []

  // Get all students
  const studentsResult = await getAllStudents()
  const students = studentsResult.success ? studentsResult.users : []

  // Get all registrations for the active semester
  const registrationsResult = await getAllRegistrations({
    semesterId: activeSemester?.id,
    limit: 100, // Increased limit to show more registrations
  })

  const registrations = registrationsResult.success ? registrationsResult.registrations : []

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Print Registration Cards"
        text="Print registration cards for students in the current semester."
      />
      <PrintRegistrationList
        initialRegistrations={registrations}
        semesters={semesters}
        students={students}
        activeSemester={activeSemester}
      />
    </DashboardShell>
  )
}
