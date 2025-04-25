import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = {
  title: "Dashboard",
}

// Helper function to safely check if a table exists
async function safeQuery(queryFn) {
  try {
    return await queryFn()
  } catch (error) {
    console.error("Error executing query:", error?.message)
    return []
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const { user } = session
  const userRole = user.role

  // Safely fetch common data
  const announcements = await safeQuery(
    () =>
      db.announcement?.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      }) || [],
  )

  const events = await safeQuery(
    () =>
      db.event?.findMany({
        take: 5,
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
      }) || [],
  )

  // Student Dashboard Data
  if (userRole === "STUDENT") {
    try {
      // Get student's courses
      const studentCourses = await safeQuery(
        () =>
          db.courseRegistration?.findMany({
            where: {
              studentId: user.id,
              status: "APPROVED",
            },
            include: {
              course: true,
            },
          }) || [],
      )

      // Get student's pending approvals
      const pendingApprovals = await safeQuery(
        () =>
          db.courseRegistration?.findMany({
            where: {
              studentId: user.id,
              status: "PENDING",
            },
            include: {
              course: true,
            },
          }) || [],
      )

      // Get student's attendance records
      const attendanceRecords = await safeQuery(
        () =>
          db.attendance?.findMany({
            where: {
              studentId: user.id,
            },
            include: {
              session: {
                include: {
                  course: true,
                },
              },
            },
            take: 10,
            orderBy: {
              createdAt: "desc",
            },
          }) || [],
      )

      // Calculate attendance percentage
      const totalSessions = await safeQuery(
        () =>
          db.attendanceSession?.count({
            where: {
              lecturerId: user.id,
              course: {
                courseRegistrations: {
                  some: {
                    studentId: user.id,
                    status: "APPROVED",
                  },
                },
              },
            },
          }) || 0,
      )

      const attendedSessions = await safeQuery(
        () =>
          db.attendance?.count({
            where: {
              studentId: user.id,
              status: "PRESENT",
            },
          }) || 0,
      )

      const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0

      return (
        <DashboardShell>
          <StudentDashboard
            user={user}
            announcements={announcements}
            events={events}
            courses={studentCourses}
            pendingApprovals={pendingApprovals}
            attendanceRecords={attendanceRecords}
            attendancePercentage={attendancePercentage}
          />
        </DashboardShell>
      )
    } catch (error) {
      console.error("Error fetching student dashboard data:", error)
      return (
        <DashboardShell>
          <div className="flex h-full items-center justify-center p-6">
            <div className="rounded-lg bg-destructive/10 p-6 text-destructive shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Error loading dashboard data</h3>
              <p>We encountered an issue while loading your data. Please try again later.</p>
            </div>
          </div>
        </DashboardShell>
      )
    }
  }

  // Staff Dashboard Data
  if (userRole === "STAFF") {
    try {
      // Get courses taught by this staff
      const staffCourses = await safeQuery(
        () =>
          db.lecturerCourse?.findMany({
            where: {
              lecturerId: user.id,
            },
            include: {
              course: true,
            },
          }) || [],
      )

      const coursesCount = await safeQuery(
        () =>
          db.lecturerCourse?.count({
            where: {
              lecturerId: user.id,
            },
          }) || 0,
      )

      // Get students in staff's courses
      const studentCount = await safeQuery(
        () =>
          db.courseRegistration?.count({
            where: {
              course: {
                lecturerCourses: {
                  some: {
                    lecturerId: user.id,
                  },
                },
              },
              status: "APPROVED",
            },
            distinct: ["studentId"],
          }) || 0,
      )

      // Get attendance sessions created by staff
      const attendanceSessionsCount = await safeQuery(
        () =>
          db.attendanceSession?.count({
            where: {
              lecturerId: user.id,
            },
          }) || 0,
      )

      // Get performance data for charts
      const performanceData = await Promise.all(
        staffCourses.map(async ({ course }) => {
          const totalStudents = await safeQuery(
            () =>
              db.courseRegistration?.count({
                where: {
                  courseId: course.id,
                  status: "APPROVED",
                },
              }) || 0,
          )

          const passedStudents = await safeQuery(
            () =>
              db.grade?.count({
                where: {
                  courseId: course.id,
                  score: {
                    gte: 50, // Assuming 50% is passing
                  },
                },
              }) || 0,
          )

          const passRate = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0

          return {
            name: course.title,
            passRate: Math.round(passRate),
            totalStudents,
          }
        }),
      )

      const staffData = {
        coursesCount,
        studentCount,
        attendanceSessionsCount,
        performanceData,
      }

      return (
        <DashboardShell>
          <StaffDashboard user={user} announcements={announcements} events={events} staffData={staffData} />
        </DashboardShell>
      )
    } catch (error) {
      console.error("Error fetching staff dashboard data:", error)
      return (
        <DashboardShell>
          <div className="flex h-full items-center justify-center p-6">
            <div className="rounded-lg bg-destructive/10 p-6 text-destructive shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Error loading dashboard data</h3>
              <p>We encountered an issue while loading your data. Please try again later.</p>
            </div>
          </div>
        </DashboardShell>
      )
    }
  }

  // Admin/Registrar Dashboard Data
  if (userRole === "REGISTRAR" || userRole === "ADMIN") {
    try {
      const studentsCount = await safeQuery(() =>
        db.user?.count({
          where: {
            role: "STUDENT",
          },
        }),
      )

      const staffCount = await safeQuery(() =>
        db.user?.count({
          where: {
            role: "STAFF",
          },
        }),
      )

      const departmentsCount = await safeQuery(() => db.department?.count())

      const coursesCount = await safeQuery(() => db.course?.count())

      const pendingApprovalsCount = await safeQuery(() =>
        db.courseRegistration?.count({
          where: {
            status: "PENDING",
          },
        }),
      )

      // Get department statistics for charts
      const departments = await safeQuery(() => db.department?.findMany() || [])

      const departmentStats = await Promise.all(
        departments.map(async (dept) => {
          // Check if department has students without using departmentId
          // This might need to be adjusted based on your actual schema
          const studentCount = await safeQuery(() =>
            db.user?.count({
              where: {
                role: "STUDENT",
                // Remove departmentId filter as it's not in the schema
              },
            }),
          )

          const courseCount = await safeQuery(() =>
            db.course?.count({
              where: {
                departmentId: dept.id,
              },
            }),
          )

          return {
            name: dept.name,
            students: studentCount || 0,
            courses: courseCount || 0,
          }
        }),
      )

      // Create adminData object with all required properties
      const adminData = {
        studentsCount: studentsCount || 0,
        staffCount: staffCount || 0,
        departmentsCount: departmentsCount || 0,
        coursesCount: coursesCount || 0,
        pendingApprovalsCount: pendingApprovalsCount || 0,
        departmentStats: departmentStats || [],
      }

      return (
        <DashboardShell>
          <AdminDashboard user={user} announcements={announcements} events={events} adminData={adminData} />
        </DashboardShell>
      )
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error)
      return (
        <DashboardShell>
          <div className="flex h-full items-center justify-center p-6">
            <div className="rounded-lg bg-destructive/10 p-6 text-destructive shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Error loading dashboard data</h3>
              <p>We encountered an issue while loading your data. Please try again later.</p>
            </div>
          </div>
        </DashboardShell>
      )
    }
  }

  return (
    <DashboardShell>
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-6">
          <span className="text-4xl text-primary">👋</span>
        </div>
        <h2 className="mb-2 text-2xl font-bold">Welcome to your dashboard!</h2>
        <p className="text-muted-foreground">Your university management portal is ready to use.</p>
      </div>
    </DashboardShell>
  )
}
