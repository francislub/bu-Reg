"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
// import type { User } from "next-auth"
import {
  Home,
  BookOpen,
  Calendar,
  UserIcon,
  Settings,
  LogOut,
  Menu,
  Users,
  FileText,
  CheckSquare,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

// interface FacultySidebarProps {
//   user: User
// }

// export function FacultySidebar({ user }: FacultySidebarProps) {
export function FacultySidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  const menuItems = [
    {
      name: "Dashboard",
      href: "/faculty/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "My Courses",
      href: "/faculty/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Student Approvals",
      href: "/faculty/approvals",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Student List",
      href: "/faculty/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Course Materials",
      href: "/faculty/materials",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Academic Calendar",
      href: "/faculty/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      href: "/faculty/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/faculty/profile",
      icon: <UserIcon className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/faculty/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-gray-900 text-white fixed md:sticky top-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out",
          isOpen || !isMobile ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 flex flex-col",
        )}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Faculty Portal</h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="6" />
              </svg>
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white",
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center gap-2 w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
          <div className="text-xs text-gray-400 mt-2">
            <p>Course Registration System</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-30 md:hidden bg-primary text-primary-foreground rounded-full shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}

