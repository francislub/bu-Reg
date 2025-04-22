import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApprovalsList } from "@/components/dashboard/approvals-list"
import { db } from "@/lib/db"

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role === "STUDENT") {
    redirect("/dashboard")
  }

  // Fetch approvals data based on user role
  let approvalsData = []

  try {
    if (session.user.role === "REGISTRAR") {
      // For registrar, fetch all pending course uploads
      approvalsData = await db.courseUpload.findMany({
        where: {
          status: "PENDING",
        },
        include: {
          course: {
            include: {
              department: true,
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
          semester: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else if (session.user.role === "STAFF") {
      // For staff, fetch course uploads for their department
      const staffDepartment = await db.departmentStaff.findUnique({
        where: {
          userId: session.user.id,
        },
        include: {
          department: true,
        },
      })

      if (staffDepartment) {
        approvalsData = await db.courseUpload.findMany({
          where: {
            status: "PENDING",
            course: {
              departmentId: staffDepartment.departmentId,
            },
          },
          include: {
            course: {
              include: {
                department: true,
              },
            },
            user: {
              include: {
                profile: true,
              },
            },
            semester: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      }
    }
  } catch (error) {
    console.error("Error fetching approvals data:", error)
    // Return empty array if there's an error
    approvalsData = []
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Approvals"
        text={
          session.user.role === "REGISTRAR"
            ? "Manage registration and course approvals."
            : "Manage course approvals for your department."
        }
      />
      <ApprovalsList initialData={approvalsData} />
    </DashboardShell>
  )
}
