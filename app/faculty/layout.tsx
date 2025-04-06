import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import type { User } from "next-auth"
import { authOptions } from "@/lib/auth"
import { FacultySidebar } from "@/components/faculty/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function FacultyLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "FACULTY") {
    redirect("/dashboard")
  }

  const user = session.user as User

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} />
      <div className="flex">
        <FacultySidebar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

