"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { StaffSidebar } from "@/components/dashboard/staff-sidebar"
import { StudentSidebar } from "@/components/dashboard/student-sidebar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Determine which sidebar to show based on user role
  const renderSidebar = () => {
    if (!session) return null

    switch (session.user.role) {
      case "ADMIN":
        return <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      case "REGISTRAR":
        return <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      case "STAFF":
        return <StaffSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      case "STUDENT":
        return <StudentSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      default:
        return <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {renderSidebar()}
      <div className="flex flex-col">
        <DashboardHeader onSidebarOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 pt-16">{children}</main>
      </div>
    </div>
  )
}
