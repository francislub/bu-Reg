import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"
import { getActiveSemester } from "@/lib/actions/semester-actions"
import { getStudentRegistration } from "@/lib/actions/registration-actions"
import { db } from "@/lib/db"

export const metadata = {
  title: "Registration Card",
  description: "View and print your registration card",
}

export default async function RegistrationCardPage({ searchParams }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  // Determine which registration to show
  const registrationId = searchParams?.id
  const userId = session.user.id
  const semesterId = null

  // If a registrar/admin is viewing a specific registration
  if (registrationId && (session.user.role === "REGISTRAR" || session.user.role === "ADMIN")) {
    // Get the registration directly by ID
    const registration = await db.registration.findUnique({
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

    if (registration) {
      return (
        <DashboardShell>
          <DashboardHeader heading="Registration Card" text="View and print the registration card for this student." />
          <PrintRegistrationCard registration={registration} />
        </DashboardShell>
      )
    } else {
      return (
        <DashboardShell>
          <DashboardHeader heading="Registration Card" text="Registration not found." />
          <div className="bg-white p-8 rounded-lg border shadow-sm">
            <p className="text-center text-muted-foreground">The requested registration could not be found.</p>
          </div>
        </DashboardShell>
      )
    }
  }

  // For students viewing their own registration
  // Get active semester
  const semesterResult = await getActiveSemester()
  const activeSemester = semesterResult.success ? semesterResult.semester : null

  if (!activeSemester) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Registration Card" text="No active semester found." />
        <div className="bg-white p-8 rounded-lg border shadow-sm">
          <p className="text-center text-muted-foreground">
            There is no active semester at the moment. Please check back later.
          </p>
        </div>
      </DashboardShell>
    )
  }

  // Get student registration for active semester
  const registrationResult = await getStudentRegistration(userId, activeSemester.id)
  const registration = registrationResult.success ? registrationResult.registration : null

  if (!registration) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Registration Card" text="No registration found for the current semester." />
        <div className="bg-white p-8 rounded-lg border shadow-sm">
          <p className="text-center text-muted-foreground">
            You have not registered for the current semester. Please complete your registration first.
          </p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Registration Card" text="View and print your registration card." />
      <PrintRegistrationCard registration={registration} />
    </DashboardShell>
  )
}
