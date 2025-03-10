import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import type { User } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStats } from "@/components/admin/stats"
import { RegistrationApprovals } from "@/components/admin/registration-approvals"
import { RecentActivity } from "@/components/admin/recent-activity"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const user = session.user as User & { role: string }
  
  if (user.role !== "ADMIN") {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <AdminStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Registration Approvals</CardTitle>
            <CardDescription>Pending course registrations that require approval</CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationApprovals />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

