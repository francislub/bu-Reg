"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin/sidebar"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/students": "Students Management",
    "/admin/courses": "Courses Management",
    "/admin/faculty": "Faculty Management",
    "/admin/registration": "Registration Management",
    "/admin/reports": "Reports",
    "/admin/notifications": "Notifications",
    "/admin/settings": "Settings",
  }

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar role="admin" />

      <div className="">
        <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {pageTitles[pathname] || "Admin Panel"}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

