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

  // Placeholder for events (in a real app, this would come from a database)
  const events = [
    {
      id: "1",
      title: "Semester Registration Deadline",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      description: "Last day to register for the current semester",
    },
    {
      id: "2",
      title: "Mid-term Examinations",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: "Mid-term examinations begin",
    },
  ]

  // For student dashboard
  let courses = []
  let pendingApprovals = []
  let attendanceRecords = []
  let attendancePercentage = 0

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

    // Placeholder for attendance records (in a real app, this would come from a database)
    attendanceRecords = []
    attendancePercentage = studentCourses.length > 0 ? 85 : 0 // Placeholder value
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
          events={events}
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
