import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApprovalsClient } from "@/components/dashboard/approvals-client"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Approvals - University Registration System",
  description: "Approve or reject student registrations and course selections",
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
            semester: {
              include: {
                academicYear: true,
              },
            },
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

  // Get approval statistics
  let approvalStats = {
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    pendingThisWeek: 0,
  }

  try {
    const [totalPending, totalApproved, totalRejected] = await Promise.all([
      db.registration.count({ where: { status: "PENDING" } }),
      db.registration.count({ where: { status: "APPROVED" } }),
      db.registration.count({ where: { status: "REJECTED" } }),
    ])

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const pendingThisWeek = await db.registration.count({
      where: {
        status: "PENDING",
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    approvalStats = {
      totalPending,
      totalApproved,
      totalRejected,
      pendingThisWeek,
    }
  } catch (error) {
    console.error("Error fetching approval statistics:", error)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Registration Approvals"
        text="Review and manage student registrations and course selections"
      >
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {approvalStats.totalPending} pending • {approvalStats.pendingThisWeek} this week
          </div>
        </div>
      </DashboardHeader>
      <ApprovalsClient
        pendingRegistrations={pendingRegistrations}
        pendingCourseUploads={pendingCourseUploads}
        approvalStats={approvalStats}
      />
    </DashboardShell>
  )
}
