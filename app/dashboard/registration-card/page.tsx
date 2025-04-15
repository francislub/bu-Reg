import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getRegistrationCard, getStudentCourses } from "@/lib/data-fetching"
import { userRoles } from "@/lib/utils"
import { StudentRegistrationCard } from "@/components/dashboard/student-registration-card"

export default async function RegistrationCardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== userRoles.STUDENT) {
    redirect("/dashboard")
  }

  const registrationCard = await getRegistrationCard(session.user.id)
  const studentCourses = await getStudentCourses(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Registration Card</h2>
        <p className="text-muted-foreground">View and print your official registration card</p>
      </div>

      <StudentRegistrationCard userId={session.user.id} registrationCard={registrationCard} courses={studentCourses} />
    </div>
  )
}
