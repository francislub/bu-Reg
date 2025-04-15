import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userRoles } from "@/lib/utils"
import { DepartmentCourses } from "@/components/dashboard/department-courses"

export default async function DepartmentCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== userRoles.STAFF) {
    redirect("/dashboard")
  }

  // Get staff department
  const staffDepartment = await prisma.departmentStaff.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      department: true,
    },
  })

  if (!staffDepartment) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Department Courses</h2>
          <p className="text-muted-foreground">Manage courses for your department</p>
        </div>

        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Department Not Assigned</h3>
          <p className="text-yellow-700">
            You are not assigned to any department. Please contact the administrator to assign you to a department.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Department Courses</h2>
        <p className="text-muted-foreground">Manage courses for {staffDepartment.department.name} department</p>
      </div>

      <DepartmentCourses departmentId={staffDepartment.departmentId} />
    </div>
  )
}
