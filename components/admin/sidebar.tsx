"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart, BookOpen, Briefcase, ClipboardList, Home, Menu, Settings, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
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
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Courses",
      href: "/admin/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Faculty",
      href: "/admin/faculty",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: "Registration",
      href: "/admin/registration",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
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
          <h2 className="text-xl font-bold">Admin Panel</h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
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
          <div className="text-xs text-gray-400">
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

