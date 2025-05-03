"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, CheckSquare, ClipboardList, FileText, GraduationCap, Home, Settings, User, Bell } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export function StudentSidebar() {
  const pathname = usePathname()

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <Home className="h-5 w-5" />,
          isActive: pathname === "/dashboard",
        },
        {
          title: "Profile",
          href: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
          isActive: pathname === "/dashboard/profile",
        },
      ],
    },
    {
      title: "Academics",
      items: [
        {
          title: "Courses",
          href: "/dashboard/courses",
          icon: <BookOpen className="h-5 w-5" />,
          isActive: pathname === "/dashboard/courses",
        },
        // {
        //   title: "Attendance",
        //   href: "/dashboard/attendance",
        //   icon: <ClipboardList className="h-5 w-5" />,
        //   isActive: pathname === "/dashboard/attendance",
        // },
        // {
        //   title: "Timetable",
        //   href: "/dashboard/timetable",
        //   icon: <Calendar className="h-5 w-5" />,
        //   isActive: pathname === "/dashboard/timetable",
        // },
      ],
    },
    {
      title: "Registration",
      items: [
        {
          title: "Registration",
          href: "/dashboard/registration",
          icon: <FileText className="h-5 w-5" />,
          isActive: pathname === "/dashboard/registration",
        },
        {
          title: "Semester Registration",
          href: "/dashboard/semester-registration",
          icon: <GraduationCap className="h-5 w-5" />,
          isActive: pathname === "/dashboard/semester-registration",
        },
        {
          title: "Approvals",
          href: "/dashboard/approvals",
          icon: <CheckSquare className="h-5 w-5" />,
          isActive: pathname === "/dashboard/approvals",
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: <Bell className="h-5 w-5" />,
          isActive: pathname === "/dashboard/notifications",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
          isActive: pathname === "/dashboard/settings",
        },
      ],
    },
  ]

  return (
    <Sidebar className="w-64 bg-gradient-to-b from-blue-900 to-blue-950 border-r border-blue-800">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-200" />
          <span className="font-bold text-white">Student Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="text-white">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-blue-300">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className="hover:bg-blue-800 active:bg-blue-700"
                    >
                      <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                        {item.icon}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail className="bg-blue-900" />
    </Sidebar>
  )
}
