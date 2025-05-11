import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApprovalsClient } from "@/components/dashboard/approvals-client"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Approvals",
  description: "Approve or reject student registrations",
}

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Only registrars and admins can access this page
  if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch pending registrations with better error handling
  let pendingRegistrations = []
  try {
    pendingRegistrations = await db.registration.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        semester: true,
        courseUploads: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error fetching pending registrations:", error)
    // Continue with empty array
  }

  // Fetch pending course uploads with better error handling
  let pendingCourseUploads = []
  try {
    pendingCourseUploads = await db.courseUpload.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
            semester: true,
          },
        },
        course: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error fetching pending uploads:", error)
    // Continue with empty array
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Approvals" text="Review and manage course registration approvals" />
      <ApprovalsClient pendingRegistrations={pendingRegistrations} pendingCourseUploads={pendingCourseUploads} />
    </DashboardShell>
  )
}
