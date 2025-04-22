import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CoursesClient } from "@/components/dashboard/courses-client"
import { db } from "@/lib/db"

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch all courses
  const courses = await db.course.findMany({
    include: {
      department: true,
      semesterCourses: {
        include: {
          semester: true,
        },
      },
    },
  })

  // Fetch all departments for the form
  const departments = await db.department.findMany()

  // For students, fetch their registered courses
  let studentCourses = []
  if (session.user.role === "STUDENT") {
    const currentSemester = await db.semester.findFirst({
      where: {
        isActive: true,
      },
    })

    if (currentSemester) {
      studentCourses = await db.courseUpload.findMany({
        where: {
          userId: session.user.id,
          semesterId: currentSemester.id,
        },
        include: {
          course: {
            include: {
              department: true,
            },
          },
          semester: true,
        },
      })
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Courses" text="Manage university courses."></DashboardHeader>
      <CoursesClient
        courses={courses}
        departments={departments}
        userRole={session.user.role}
        studentCourses={studentCourses}
      />
    </DashboardShell>
  )
}
