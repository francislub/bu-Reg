import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SemesterRegistrationClient } from "@/components/dashboard/semester-registration-client"

export const metadata = {
  title: "Semester Registration",
  description: "Register for courses in the current semester",
}

export default async function SemesterRegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Only students can access this page
  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Fetch active semesters - using isActive instead of status
  const activeSemesters = await db.semester.findMany({
    where: {
      isActive: true,
    },
    include: {
      academicYear: true,
    },
    orderBy: {
      startDate: "desc",
    },
  })

  // Fetch student's program
  const student = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      profile: true,
    },
  })

  const programId = student?.profile?.programId

  // Fetch student's existing registrations
  const existingRegistrations = await db.registration.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      semester: true,
      courseUploads: {
        include: {
          course: true,
        },
      },
    },
  })

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Semester Registration</h2>
          <p className="text-muted-foreground">Register for courses in the current semester</p>
        </div>
      </div>
      <div className="grid gap-8">
        <SemesterRegistrationClient
          semesters={activeSemesters}
          programId={programId}
          userId={session.user.id}
          existingRegistrations={existingRegistrations}
        />
      </div>
    </DashboardShell>
  )
}
