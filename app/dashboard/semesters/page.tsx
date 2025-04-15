import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { SemesterManagement } from "@/components/dashboard/semester-management"

export default async function SemestersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== userRoles.REGISTRAR) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Semester Management</h2>
        <p className="text-muted-foreground">Create and manage academic semesters</p>
      </div>

      <SemesterManagement />
    </div>
  )
}
