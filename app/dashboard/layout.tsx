import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SiteHeader } from "@/components/dashboard/site-header"
import { UserAccountNav } from "@/components/dashboard/user-account-nav"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import { StaffSidebar } from "@/components/dashboard/staff-sidebar"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MainNav } from "@/components/dashboard/main-nav"
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
            <MainNav userRole={userRole} />
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
          <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-30">
            {userRole === "REGISTRAR" && <AdminSidebar />}
            {userRole === "STAFF" && <StaffSidebar />}
            {userRole === "STUDENT" && <StudentSidebar />}
          </div>
          <SidebarInset className="ml-0 md:ml-64 w-full">
            <main className="flex w-full flex-1 flex-col overflow-hidden p-6">{children}</main>

          </SidebarInset>
        </div>
      </div>
      <AutoLogout timeoutMinutes={30} />
    </SidebarProvider>
  )
}
