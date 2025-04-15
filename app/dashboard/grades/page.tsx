import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { userRoles } from "@/lib/utils"
import { StudentGradesView } from "@/components/dashboard/student-grades-view"

export default async function GradesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Only students can access this page
  if (session.user.role !== userRoles.STUDENT) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Grades</h2>
        <p className="text-muted-foreground">View your academic performance and results</p>
      </div>
      <StudentGradesView userId={session.user.id} />
    </div>
  )
}
