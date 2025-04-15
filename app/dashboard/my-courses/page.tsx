import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getStudentCourses } from "@/lib/data-fetching"
import { userRoles } from "@/lib/utils"
import { StudentCoursesList } from "@/components/dashboard/student-courses-list"

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== userRoles.STUDENT) {
    redirect("/dashboard")
  }

  const studentCourses = await getStudentCourses(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
        <p className="text-muted-foreground">View and manage your registered courses</p>
      </div>

      <StudentCoursesList userId={session.user.id} courses={studentCourses} />
    </div>
  )
}
