import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { db } from "@/lib/db"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch user profile data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings." />
      <ProfileForm initialData={user} />
    </DashboardShell>
  )
}
