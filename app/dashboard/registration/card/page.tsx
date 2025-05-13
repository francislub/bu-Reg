import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"
import { getRegistrationCard } from "@/lib/actions/registration-actions"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { db } from "@/lib/db"

export const metadata = {
  title: "Registration Card",
  description: "View and print your registration card",
}

export default async function RegistrationCardPage({
  searchParams,
}: {
  searchParams: { id?: string; semesterId?: string; studentId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  // Get registration ID from query params or use the active semester
  const registrationId = searchParams.id
  const semesterId = searchParams.semesterId
  const studentId = searchParams.studentId

  // Determine which user ID to use (for registrars viewing student cards)
  const userId = session.user.role === "REGISTRAR" && studentId ? studentId : session.user.id

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
    // Fetch by registration ID with expanded data
    const response = await db.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        semester: {
          include: {
            academicYear: true,
          },
        },
        courseUploads: {
          include: {
            course: {
              include: {
                department: true,
              },
            },
          },
        },
        registrationCard: true,
      },
    })

    if (response) {
      registration = response
    }
  } else if (semesterId) {
    // Fetch by semester ID
    const cardResult = await getRegistrationCard(userId, semesterId)
    if (cardResult.success) {
      registration = cardResult.registration || {
        id: "temp-id",
        userId: userId,
        semesterId: semesterId,
        status: "APPROVED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: userId,
          name: session.user.name,
          email: session.user.email,
          profile: cardResult.registrationCard?.user.profile,
        },
        semester: cardResult.registrationCard?.semester,
        courseUploads: cardResult.courses,
        registrationCard: cardResult.registrationCard,
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
      <PrintRegistrationCard registration={registration} />
    </DashboardShell>
  )
}
