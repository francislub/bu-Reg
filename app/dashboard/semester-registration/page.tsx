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

  // Fetch student's profile to get program information
  const student = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      profile: true,
    },
  })

  // Get program name if programId exists
  let programName = "Unknown Program"
  if (student?.profile?.programId) {
    const program = await db.program.findUnique({
      where: {
        id: student.profile.programId,
      },
    })
    programName = program?.name || student?.profile?.program || "Unknown Program"
  }

  const programId = student?.profile?.programId
  // programName is now defined above

  if (!programId) {
    // If student doesn't have a program assigned, show a message
    return (
      <DashboardShell>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Semester Registration</h2>
            <p className="text-muted-foreground">Register for courses in the current semester</p>
          </div>
        </div>
        <div className="grid gap-8">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Program Not Assigned</h3>
            <p className="text-yellow-700">
              You don't have a program assigned to your profile. Please contact the registrar's office to have your
              program assigned before you can register for courses.
            </p>
          </div>
        </div>
      </DashboardShell>
    )
  }

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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700">
            You are registering for courses in the <strong>{programName}</strong> program.
          </p>
        </div>
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
