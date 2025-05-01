import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"

export const metadata: Metadata = {
  title: "Registration Card",
  description: "Print your registration card",
}

export default async function RegistrationCardPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  const registrationId = searchParams.id

  if (!registrationId) {
    redirect("/dashboard/registration")
  }

  // Get registration details
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
        where: {
          status: "APPROVED",
        },
        include: {
          course: true,
        },
      },
    },
  })

  // Check if registration exists and belongs to the user
  if (
    !registration ||
    (registration.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "REGISTRAR")
  ) {
    redirect("/dashboard/registration")
  }

  // Check if registration is approved
  if (registration.status !== "APPROVED") {
    redirect("/dashboard/registration")
  }

  // Get registration card
  const registrationCard = await db.registrationCard.findFirst({
    where: {
      userId: registration.userId,
      semesterId: registration.semesterId,
    },
  })

  if (!registrationCard) {
    redirect("/dashboard/registration")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Registration Card</h1>
        <p className="text-muted-foreground">Print your registration card for {registration.semester.name}</p>
      </div>

      <PrintRegistrationCard registration={registration} registrationCard={registrationCard} />
    </div>
  )
}
