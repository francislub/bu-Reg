import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { DepartmentManagement } from "@/components/dashboard/department-management"

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only registrars can access this page
  if (session.user.role !== userRoles.REGISTRAR) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Department Management</h2>
        <p className="text-muted-foreground">Create and manage university departments</p>
      </div>
      <DepartmentManagement />
    </div>
  )
}
