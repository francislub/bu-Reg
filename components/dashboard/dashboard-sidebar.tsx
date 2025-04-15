"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Book,
  GraduationCap,
  LayoutDashboard,
  FileText,
  MenuIcon,
  Users,
  BarChart3,
  Calendar,
  History,
  Pencil,
  Clock,
  CalendarCheck,
  User,
  FileHeart,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href: string
    role: string[]
  }[]
  userRole: string
}

export function Sidebar({ className, isCollapsed, links, userRole }: SidebarProps) {
  const pathname = usePathname()

  // Filter links based on user role
  const filteredLinks = links.filter((link) => link.role.includes(userRole))

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors",
                  pathname === link.href ? "bg-accent text-accent-foreground" : "transparent",
                  isCollapsed ? "justify-center" : "",
                )}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  {!isCollapsed && <span>{link.title}</span>}
                </div>
                {link.label && !isCollapsed && (
                  <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {link.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SidebarSm({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const iconSize = 16

  const links = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={iconSize} />,
      variant: "default",
      href: "/dashboard",
      role: ["STUDENT", "STAFF", "REGISTRAR"],
    },
    {
      title: "My Courses",
      icon: <Book size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/my-courses",
      role: ["STUDENT"],
    },
    {
      title: "Register Courses",
      icon: <Pencil size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/register-courses",
      role: ["STUDENT"],
    },
    {
      title: "My Timetable",
      icon: <Calendar size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/my-timetable",
      role: ["STUDENT", "STAFF"],
    },
    {
      title: "My Attendance",
      icon: <CalendarCheck size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/student-attendance",
      role: ["STUDENT"],
    },
    {
      title: "Registration Card",
      icon: <FileHeart size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/registration-card",
      role: ["STUDENT"],
    },
    {
      title: "Registration History",
      icon: <History size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/history",
      role: ["STUDENT"],
    },
    {
      title: "Manage Courses",
      icon: <Book size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/courses",
      role: ["REGISTRAR"],
    },
    {
      title: "Department Courses",
      icon: <Book size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/department-courses",
      role: ["STAFF"],
    },
    {
      title: "Registrations",
      icon: <FileText size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/approvals",
      role: ["STAFF"],
    },
    {
      title: "Manage Attendance",
      icon: <Clock size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/attendance",
      role: ["STAFF"],
    },
    {
      title: "Manage Semesters",
      icon: <Calendar size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/semesters",
      role: ["REGISTRAR"],
    },
    {
      title: "Timetables",
      icon: <Calendar size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/timetables",
      role: ["REGISTRAR"],
    },
    {
      title: "Lecturer Assignment",
      icon: <Users size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/lecturer-assignment",
      role: ["REGISTRAR"],
    },
    {
      title: "Analytics",
      icon: <BarChart3 size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/analytics",
      role: ["STAFF", "REGISTRAR"],
    },
    {
      title: "Reports",
      icon: <FileText size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/reports",
      role: ["REGISTRAR"],
    },
    {
      title: "Profile Settings",
      icon: <User size={iconSize} />,
      variant: "ghost",
      href: "/dashboard/settings",
      role: ["STUDENT", "STAFF", "REGISTRAR"],
    },
  ]

  // Filter links based on user role
  const filteredLinks = links.filter((link) => link.role.includes(userRole))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="flex h-10 w-10 items-center justify-center p-0 md:hidden">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <div className="flex items-center gap-2 mb-8">
          <GraduationCap className="h-6 w-6" />
          <span className="text-lg font-semibold">Bugema University</span>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="pl-1 pr-7">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === link.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {link.icon}
                {link.title}
                {link.label && (
                  <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {link.label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
