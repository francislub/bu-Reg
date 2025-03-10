import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import type { User } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FacultyStats } from "@/components/faculty/stats"
import { FacultyCourses } from "@/components/faculty/courses"
import { EnrolledStudents } from "@/components/faculty/enrolled-students"

export default async function FacultyDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const user = session.user as User & { id: string; role: string }
  
  if (user.role !== "FACULTY") {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
      </div>

      <FacultyStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Courses you are teaching this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <FacultyCourses facultyId={user.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>Students enrolled in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <EnrolledStudents facultyId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

