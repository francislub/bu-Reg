"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Building, Calendar, CheckSquare, ClipboardList, FileText, GraduationCap, Home, Settings, User, Users, BarChart, Bell, Shield } from 'lucide-react'
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

export function AdminSidebar() {
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
      title: "Management",
      items: [
        {
          title: "Students",
          href: "/dashboard/students",
          icon: <Users className="h-5 w-5" />,
          isActive: pathname === "/dashboard/students",
        },
        {
          title: "Staff",
          href: "/dashboard/staff",
          icon: <User className="h-5 w-5" />,
          isActive: pathname === "/dashboard/staff",
        },
        {
          title: "Departments",
          href: "/dashboard/departments",
          icon: <Building className="h-5 w-5" />,
          isActive: pathname === "/dashboard/departments",
        },
        {
          title: "Courses",
          href: "/dashboard/courses",
          icon: <BookOpen className="h-5 w-5" />,
          isActive: pathname === "/dashboard/courses",
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Approvals",
          href: "/dashboard/approvals",
          icon: <CheckSquare className="h-5 w-5" />,
          isActive: pathname === "/dashboard/approvals",
        },
        {
          title: "Announcements",
          href: "/dashboard/announcements",
          icon: <Bell className="h-5 w-5" />,
          isActive: pathname === "/dashboard/announcements",
        },
        {
          title: "Reports",
          href: "/dashboard/reports",
          icon: <BarChart className="h-5 w-5" />,
          isActive: pathname === "/dashboard/reports",
        },
        // {
        //   title: "Security",
        //   href: "/dashboard/security",
        //   icon: <Shield className="h-5 w-5" />,
        //   isActive: pathname === "/dashboard/security",
        // },
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
    <Sidebar className="w-64 bg-gradient-to-b from-purple-900 to-purple-950 border-r border-purple-800">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-purple-800">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-purple-200" />
          <span className="font-bold text-white">Admin Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="text-white">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-purple-300">{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className="hover:bg-purple-800 active:bg-purple-700"
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
      <SidebarRail className="bg-purple-900" />
    </Sidebar>
  )
}
