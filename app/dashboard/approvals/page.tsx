import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { RegistrationApprovalsList } from "@/components/dashboard/registration-approvals-list"

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === userRoles.STUDENT) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Registration Approvals</h2>
        <p className="text-muted-foreground">
          {session.user.role === userRoles.REGISTRAR
            ? "Manage and approve student registration requests"
            : "Approve course registrations for students in your department"}
        </p>
      </div>

      <RegistrationApprovalsList userRole={session.user.role} userId={session.user.id} />
    </div>
  )
}
