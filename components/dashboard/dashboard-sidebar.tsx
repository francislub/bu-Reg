"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Home,
  Settings,
  User,
  Users,
} from "lucide-react"
import { useSession } from "next-auth/react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"

  const isAdmin = userRole === "ADMIN"
  const isStaff = userRole === "STAFF" || userRole === "REGISTRAR"
  const isStudent = userRole === "STUDENT"

  return (
    <div className="flex h-full w-full flex-col bg-black text-white">
      <div className="flex-1 overflow-auto py-8 px-4">
        <nav className="grid items-start gap-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
              pathname === "/dashboard" ? "bg-gray-700 text-white" : "text-gray-400",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {isStudent && (
            <>
              <Link
                href="/dashboard/courses"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/courses" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
              </Link>
              <Link
                href="/dashboard/attendance"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/attendance" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span>Attendance</span>
              </Link>
              <Link
                href="/dashboard/timetable"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/timetable" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Timetable</span>
              </Link>
              <Link
                href="/dashboard/registration"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/registration" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Registration</span>
              </Link>
              <Link
                href="/dashboard/approvals"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/approvals" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <Clock className="h-4 w-4" />
                <span>Approvals</span>
              </Link>
            </>
          )}

          {isStaff && (
            <>
              <Link
                href="/dashboard/courses"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/courses" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
              </Link>
              <Link
                href="/dashboard/students"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/students" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Students</span>
              </Link>
              <Link
                href="/dashboard/attendance"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/attendance" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span>Attendance</span>
              </Link>
              <Link
                href="/dashboard/timetable"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/timetable" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Timetable</span>
              </Link>
              <Link
                href="/dashboard/approvals"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/approvals" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <Clock className="h-4 w-4" />
                <span>Approvals</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/dashboard/departments"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/departments" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Departments</span>
              </Link>
              <Link
                href="/dashboard/staff"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
                  pathname === "/dashboard/staff" ? "bg-gray-700 text-white" : "text-gray-400",
                )}
              >
                <Users className="h-4 w-4" />
                <span>Staff</span>
              </Link>
            </>
          )}

          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
              pathname === "/dashboard/profile" ? "bg-gray-700 text-white" : "text-gray-400",
            )}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-800",
              pathname === "/dashboard/settings" ? "bg-gray-700 text-white" : "text-gray-400",
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
