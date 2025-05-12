"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/dashboard/site-header"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"
import { StaffSidebar } from "@/components/dashboard/staff-sidebar"
import { useSession } from "next-auth/react"
import { useSidebarStore } from "@/lib/store/sidebar-store"
import { AutoLogout } from "@/components/auto-logout"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { isOpen } = useSidebarStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const userRole = session?.user?.role || "STUDENT"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 transform border-r bg-background transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0" // Always show on medium screens and above
          )}
        >
          {userRole === "ADMIN" || userRole === "REGISTRAR" ? (
            <AdminSidebar />
          ) : userRole === "STAFF" ? (
            <StaffSidebar />
          ) : (
            <StudentSidebar />
          )}
        </div>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 px-4 py-6 md:px-6 md:py-8",
            isOpen ? "md:ml-64" : "", // Add margin when sidebar is open on medium screens and above
            "transition-all duration-300 ease-in-out" // Smooth transition
          )}
        >
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <AutoLogout />
    </div>
  )
}
