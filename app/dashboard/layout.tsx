import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SiteHeader } from "@/components/dashboard/site-header"
import { UserAccountNav } from "@/components/dashboard/user-account-nav"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import { StaffSidebar } from "@/components/dashboard/staff-sidebar"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarToggle } from "@/components/dashboard/sidebar-toggle"
import { AutoLogout } from "@/components/auto-logout"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const userRole = session.user.role || "STUDENT"

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader>
          <div className="flex items-center">
            <SidebarToggle />
          </div>
          <UserAccountNav
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              role: userRole,
            }}
          />
        </SiteHeader>
        <div className="flex flex-1 relative">
          {userRole === "REGISTRAR" && <AdminSidebar />}
          {userRole === "STAFF" && <StaffSidebar />}
          {userRole === "STUDENT" && <StudentSidebar />}

          <main className="flex-1 transition-all duration-300 ease-in-out md:ml-64 p-6 overflow-auto">{children}</main>
        </div>
      </div>
      <AutoLogout timeoutMinutes={30} />
    </SidebarProvider>
  )
}
