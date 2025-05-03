import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"
import { getRegistrationCard } from "@/lib/actions/registration-actions"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata = {
  title: "Registration Card",
  description: "View and print your registration card",
}

export default async function RegistrationCardPage({
  searchParams,
}: {
  searchParams: { id?: string; semesterId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  // Get registration ID from query params or use the active semester
  const registrationId = searchParams.id
  const semesterId = searchParams.semesterId

  if (!registrationId && !semesterId) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Registration Card" text="View and print your registration card" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No registration ID or semester ID provided. Please go to your registrations and select a card to print.
          </AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

  // Fetch registration data
  let registration
  if (registrationId) {
    // Fetch by registration ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/registrations/${registrationId}/details`, {
      cache: "no-store",
    })
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        registration = data.registration
      }
    }
  } else if (semesterId) {
    // Fetch by semester ID
    const cardResult = await getRegistrationCard(session.user.id, semesterId)
    if (cardResult.success) {
      registration = {
        id: registrationId || "temp-id",
        userId: session.user.id,
        semesterId: semesterId,
        status: "APPROVED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          profile: cardResult.registrationCard.user.profile,
        },
        semester: cardResult.registrationCard.semester,
        courseUploads: cardResult.courses,
      }
    }
  }

  if (!registration) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Registration Card" text="View and print your registration card" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            Registration card not found. Make sure your registration has been approved by the registrar.
          </AlertDescription>
        </Alert>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Registration Card" text="View and print your registration card" />
      {registration.status !== "APPROVED" ? (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Registration Not Approved</AlertTitle>
          <AlertDescription>
            Your registration has not been approved yet. You can print your registration card once it's approved by the
            registrar.
          </AlertDescription>
        </Alert>
      ) : (
        <PrintRegistrationCard registration={registration} />
      )}
    </DashboardShell>
  )
}
