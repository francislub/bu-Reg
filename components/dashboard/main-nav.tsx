"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GraduationCap } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <GraduationCap className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Bugema University</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/courses"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard/courses" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Courses
        </Link>
        <Link
          href="/dashboard/attendance"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard/attendance" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Attendance
        </Link>
        <Link
          href="/dashboard/timetable"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard/timetable" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Timetable
        </Link>
        <Link
          href="/dashboard/profile"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard/profile" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Profile
        </Link>
      </nav>
    </div>
  )
}
