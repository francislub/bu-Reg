import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApprovalsList } from "@/components/dashboard/approvals-list"

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role === "STUDENT") {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Approvals"
        text={
          session.user.role === "REGISTRAR"
            ? "Manage registration and course approvals."
            : "Manage course approvals for your department."
        }
      />
      <ApprovalsList />
    </DashboardShell>
  )
}
