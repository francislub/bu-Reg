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

  // Fetch dashboard statistics
  const dashboardStats = {
    students: await db.user.count({ where: { role: "STUDENT" } }),
    staff: await db.user.count({ where: { role: "STAFF" } }),
    departments: await db.department.count(),
    courses: await db.course.count(),
    pendingApprovals: await db.registration.count({ where: { status: "PENDING" } }),
    registrations: await db.registration.count(),
  }

  // Get historical data for trend calculation (from 30 days ago)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const historicalStats = {
    students: await db.user.count({
      where: {
        role: "STUDENT",
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    staff: await db.user.count({
      where: {
        role: "STAFF",
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    departments: await db.department.count({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    courses: await db.course.count({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    pendingApprovals: await db.registration.count({
      where: {
        status: "PENDING",
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
    registrations: await db.registration.count({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
  }

  // Calculate trends (percentage change)
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number((((current - previous) / previous) * 100).toFixed(1))
  }

  const trends = {
    students: calculateTrend(dashboardStats.students, historicalStats.students),
    staff: calculateTrend(dashboardStats.staff, historicalStats.staff),
    departments: calculateTrend(dashboardStats.departments, historicalStats.departments),
    courses: calculateTrend(dashboardStats.courses, historicalStats.courses),
    pendingApprovals: calculateTrend(dashboardStats.pendingApprovals, historicalStats.pendingApprovals),
    registrations: calculateTrend(dashboardStats.registrations, historicalStats.registrations),
  }

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
      {session.user.role === "ADMIN" && (
        <AdminDashboard user={session.user} announcements={announcements} stats={dashboardStats} trends={trends} />
      )}
      {session.user.role === "STAFF" && <StaffDashboard user={session.user} announcements={announcements} />}
      {session.user.role === "REGISTRAR" && (
        <AdminDashboard user={session.user} announcements={announcements} stats={dashboardStats} trends={trends} />
      )}
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
