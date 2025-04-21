"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, CheckSquare, ClipboardList, Home, Settings, User } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

export function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Courses",
      href: "/dashboard/courses",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      title: "Timetable",
      href: "/dashboard/timetable",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Attendance",
      href: "/dashboard/attendance",
      icon: <CheckSquare className="mr-2 h-4 w-4" />,
    },
    {
      title: "Registration",
      href: "/dashboard/registration",
      icon: <ClipboardList className="mr-2 h-4 w-4" />,
      roles: ["STUDENT"],
    },
    {
      title: "Approvals",
      href: "/dashboard/approvals",
      icon: <CheckSquare className="mr-2 h-4 w-4" />,
      roles: ["STAFF", "REGISTRAR"],
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {navItems
        .filter((item) => !item.roles || item.roles.includes(userRole))
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent",
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
    </nav>
  )
}
