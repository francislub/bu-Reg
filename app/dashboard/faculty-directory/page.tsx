import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { FacultyDirectoryView } from "@/components/dashboard/faculty-directory-view"

export default async function FacultyDirectoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Faculty Directory</h2>
        <p className="text-muted-foreground">Browse and search for faculty members across all departments</p>
      </div>
      <FacultyDirectoryView />
    </div>
  )
}
