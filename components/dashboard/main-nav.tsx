"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GraduationCap } from "lucide-react"

interface MainNavProps {
  userRole?: string
}

export function MainNav({ userRole = "STUDENT" }: MainNavProps) {
  const pathname = usePathname()

  // Define navigation items based on user role
  const navItems = {
    STUDENT: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/courses", label: "Courses" },
      { href: "/dashboard/timetable", label: "Timetable" },
    ],
    STAFF: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/courses", label: "Courses" },
      { href: "/dashboard/students", label: "Students" },
      { href: "/dashboard/attendance", label: "Attendance" },
    ],
    REGISTRAR: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/students", label: "Students" },
      { href: "/dashboard/staff", label: "Staff" },
      { href: "/dashboard/departments", label: "Departments" },
    ],
  }

  // Get the appropriate navigation items for the user role
  const items = navItems[userRole as keyof typeof navItems] || navItems.STUDENT

  // Set the appropriate color based on user role
  const roleColors = {
    STUDENT: "text-blue-600 hover:text-blue-700",
    STAFF: "text-green-600 hover:text-green-700",
    REGISTRAR: "text-purple-600 hover:text-purple-700",
  }

  const primaryColor = roleColors[userRole as keyof typeof roleColors] || roleColors.STUDENT

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <GraduationCap className={`h-6 w-6 ${primaryColor}`} />
        <span className="hidden font-bold sm:inline-block">Bugema University</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-primary",
              pathname === item.href ? primaryColor : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
