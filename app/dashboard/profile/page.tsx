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
  let user = null

  try {
    user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    })

    if (!user) {
      // If user not found, create a basic user object with session data
      user = {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role || "STUDENT",
        profile: null,
      }
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    // Create a basic user object with session data if there's an error
    user = {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      role: session.user.role || "STUDENT",
      profile: null,
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings." />
      <ProfileForm initialData={user} />
    </DashboardShell>
  )
}
