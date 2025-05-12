import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { db } from "@/lib/db"
import { getUserProfile } from "@/lib/actions/user-actions"
import { getProgramById } from "@/lib/actions/program-actions"
import { getDepartmentById } from "@/lib/actions/department-actions"

export const metadata = {
  title: "Dashboard",
  description: "Dashboard for Bugema University Registration System",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Get user profile
  const userProfileResult = await getUserProfile(session.user.id)
  const userProfile = userProfileResult.success ? userProfileResult.user : null

  // Get program and department info if available
  let programInfo = null
  if (userProfile?.profile?.programId) {
    const programResult = await getProgramById(userProfile.profile.programId)
    const departmentResult = userProfile.profile.departmentId
      ? await getDepartmentById(userProfile.profile.departmentId)
      : null

    if (programResult.success) {
      programInfo = {
        name: programResult.program.name,
        department: departmentResult?.success
          ? departmentResult.department.name
          : programResult.program.department.name,
      }
    }
  }

  // Fetch announcements
  const announcements = await db.announcement.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // For student dashboard
  let courses = []
  let pendingApprovals = []
  
  // Set default values for attendance data
  const attendanceRecords = []
  const attendancePercentage = 0

  if (session.user.role === "STUDENT") {
    // Get student's courses
    const studentCourses = await db.courseUpload.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ["APPROVED", "PENDING"],
        },
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        semester: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    courses = studentCourses

    // Get pending approvals
    pendingApprovals = studentCourses.filter((course) => course.status === "PENDING")
  }

  return (
    <DashboardShell>
      {session.user.role === "ADMIN" && <AdminDashboard user={session.user} announcements={announcements} />}
      {session.user.role === "STAFF" && <StaffDashboard user={session.user} announcements={announcements} />}
      {session.user.role === "REGISTRAR" && <AdminDashboard user={session.user} announcements={announcements} />}
      {session.user.role === "STUDENT" && (
        <StudentDashboard
          user={session.user}
          announcements={announcements}
          courses={courses}
          pendingApprovals={pendingApprovals}
          attendanceRecords={attendanceRecords}
          attendancePercentage={attendancePercentage}
          programInfo={programInfo}
        />
      )}
    </DashboardShell>
  )
}
