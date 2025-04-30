import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import ClientRegistrationPage from "@/components/dashboard/client-registration-page"

export const metadata = {
  title: "Course Registration",
  description: "Register for courses for the upcoming semester",
}

export default async function RegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  // Only students can register for courses
  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Course Registration" text="Register for courses for the current semester." />
      <ClientRegistrationPage />
    </DashboardShell>
  )
}
