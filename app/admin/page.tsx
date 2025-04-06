import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminHeader } from "@/components/admin/header"
import { AdminDashboard } from "@/components/admin/dashboard"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen">
      <AdminHeader user={session.user} />

        <main className="flex-1 bg-gray-100 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <AdminDashboard />
          </div>
        </main>
    </div>
  )
}

