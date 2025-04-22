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

  // Initialize variables
  let courses = []
  let departments = []
  let studentCourses = []

  try {
    // Fetch all departments for the form
    departments = await db.department.findMany()

    // Fetch all courses with proper error handling for null departmentId
    courses = await db.course.findMany({
      where: {
        departmentId: {
          not: null, // Ensure departmentId is not null
        },
      },
      include: {
        department: true,
        semesterCourses: {
          include: {
            semester: true,
          },
        },
      },
    })

    // For students, fetch their registered courses
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
  } catch (error) {
    console.error("Error fetching courses data:", error)
    // Keep empty arrays if there's an error
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
