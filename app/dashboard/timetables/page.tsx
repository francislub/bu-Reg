import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { TimetableManagement } from "@/components/dashboard/timetable-management"

export default async function TimetablesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== userRoles.REGISTRAR) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timetable Management</h1>
        <p className="text-muted-foreground">Create and manage timetables for courses and lecturers</p>
      </div>
      <TimetableManagement />
    </div>
  )
}
