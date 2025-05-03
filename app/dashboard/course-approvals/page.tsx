import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CourseApprovalsClient } from "@/components/dashboard/course-approvals-client"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Course Approvals",
  description: "Approve or reject student course registrations by semester",
}

export default async function CourseApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Only registrars and admins can access this page
  if (session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch all semesters for filtering
  const semesters = await db.semester.findMany({
    include: {
      academicYear: true,
    },
    orderBy: [
      {
        academicYear: {
          year: "desc",
        },
      },
      {
        startDate: "desc",
      },
    ],
  })

  // Fetch all departments for filtering
  const departments = await db.department.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Course Approvals" text="Review and manage course registrations by semester" />
      <CourseApprovalsClient semesters={semesters} departments={departments} />
    </DashboardShell>
  )
}
