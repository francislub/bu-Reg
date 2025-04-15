import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { LecturerAssignmentManagement } from "@/components/dashboard/lecturer-assignment-management"

export default async function LecturerAssignmentPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== userRoles.REGISTRAR) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lecturer Assignment</h1>
        <p className="text-muted-foreground">Assign lecturers to courses for the current semester</p>
      </div>
      <LecturerAssignmentManagement />
    </div>
  )
}
