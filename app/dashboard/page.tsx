import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const userRole = session.user.role || "STUDENT"

  // Fetch user data with related information
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      registrations: {
        include: {
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
        take: 1,
      },
      attendanceRecords: {
        include: {
          session: {
            include: {
              course: true,
            },
          },
        },
        where: {
          session: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
    },
  })

  // Check if announcement model exists in the schema
  let announcements = []
  try {
    // Fetch announcements if the model exists
    if (db.announcement) {
      announcements = await db.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })
    } else if (db.notification) {
      // Try using notification model as a fallback
      announcements = await db.notification.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })
    }
  } catch (error) {
    console.error("Error fetching announcements:", error)
    // Provide fallback data
    announcements = [
      {
        id: "1",
        title: "Welcome to the new semester",
        content: "We hope you have a great academic year ahead!",
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Registration deadline approaching",
        content: "Please complete your course registration by the end of this week.",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ]
  }

  // Check if event model exists in the schema
  let events = []
  try {
    // Fetch events if the model exists
    if (db.event) {
      events = await db.event.findMany({
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      })
    } else if (db.calendar) {
      // Try using calendar model as a fallback
      events = await db.calendar.findMany({
        where: {
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      })
    }
  } catch (error) {
    console.error("Error fetching events:", error)
    // Provide fallback data
    events = [
      {
        id: "1",
        title: "Mid-term Examinations",
        description: "Mid-term examinations for all courses",
        date: new Date(Date.now() + 7 * 86400000), // 7 days from now
      },
      {
        id: "2",
        title: "Career Fair",
        description: "Annual university career fair with industry representatives",
        date: new Date(Date.now() + 14 * 86400000), // 14 days from now
      },
    ]
  }

  // Fetch additional data for staff and admin dashboards
  let staffData = {}
  let adminData = {}

  if (userRole === "STAFF") {
    try {
      const coursesCount = await db.course.count({
        where: {
          lecturers: {
            some: {
              id: session.user.id
            }
          }
        }
      })

      const studentsCount = await db.attendanceRecord.count({
        distinct: ['studentId'],
        where: {
          session: {
            lecturerId: session.user.id
          }
        }
      })

      const sessionsCount = await db.attendanceSession.count({
        where: {
          lecturerId: session.user.id
        }
      })

      staffData = {
        coursesCount,
        studentsCount,
        sessionsCount
      }
    } catch (error) {
      console.error("Error fetching staff data:", error)
      staffData = {
        coursesCount: 0,
        studentsCount: 0,
        sessionsCount: 0
      }
    }
  } else if (userRole === "REGISTRAR") {
    try {
      const studentsCount = await db.user.count({
        where: {
          role: "STUDENT"
        }
      })

      const staffCount = await db.user.count({
        where: {
          role: "STAFF"
        }
      })

      const departmentsCount = await db.department.count()
      const coursesCount = await db.course.count()
      const pendingApprovalsCount = await db.courseUpload.count({
        where: {
          status: "PENDING"
        }
      })

      adminData = {
        studentsCount,
        staffCount,
        departmentsCount,
        coursesCount,
        pendingApprovalsCount
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
      adminData = {
        studentsCount: 0,
        staffCount: 0,
        departmentsCount: 0,
        coursesCount: 0,
        pendingApprovalsCount: 0
      }
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Welcome, ${user?.profile?.firstName || session.user.name}`}
        text="Here's an overview of your academic progress and activities."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        {userRole === "STUDENT" && (
          <StudentDashboard 
            user={user} 
            announcements={announcements} 
            events={events} 
          />
        )}
        {userRole === "STAFF" && (
          <StaffDashboard 
            user={user} 
            announcements={announcements} 
            events={events} 
            staffData={staffData}
          />
        )}
        {userRole === "REGISTRAR" && (
          <AdminDashboard 
            user={user} 
            announcements={announcements} 
            events={events} 
            adminData={adminData}
          />
        )}
      </Suspense>
    </DashboardShell>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
