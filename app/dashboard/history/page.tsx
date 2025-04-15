import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { getStudentRegistrationHistory } from "@/lib/data-fetching"
import { RegistrationHistory } from "@/components/dashboard/registration-history"

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== userRoles.STUDENT) {
    redirect("/dashboard")
  }

  const registrationHistory = await getStudentRegistrationHistory(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Registration History</h2>
        <p className="text-muted-foreground">View your past course registrations</p>
      </div>

      <RegistrationHistory registrations={registrationHistory} />
    </div>
  )
}
