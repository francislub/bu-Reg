import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import type { User } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CourseRegistration } from "@/components/dashboard/course-registration"

export default async function RegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const user = session.user as User & { id: string }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Registration</h1>
      </div>

      <CourseRegistration userId={user.id} />
    </div>
  )
}

