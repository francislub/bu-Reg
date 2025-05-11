"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Building,
  CheckSquare,
  GraduationCap,
  Home,
  Settings,
  User,
  Users,
  BarChart,
  Bell,
  Calendar,
} from "lucide-react"
import { useSidebarStore } from "@/lib/store/sidebar-store"
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
  const { isOpen, close } = useSidebarStore()

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
          title: "Academic Years",
          href: "/dashboard/academic-years",
          icon: <Calendar className="h-5 w-5" />,
          isActive: pathname.startsWith("/dashboard/academic-years"),
        },
        {
          title: "Programs",
          href: "/dashboard/programs",
          icon: <GraduationCap className="h-5 w-5" />,
          isActive: pathname === "/dashboard/programs",
        },
        {
          title: "Students",
          href: "/dashboard/students",
          icon: <Users className="h-5 w-5" />,
          isActive: pathname === "/dashboard/students",
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
        {
          title: "Semesters",
          href: "/dashboard/semesters",
          icon: <Calendar className="h-5 w-5" />,
          isActive: pathname === "/dashboard/semesters",
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
          title: "Registration Reports",
          href: "/dashboard/registration-reports",
          icon: <BarChart className="h-5 w-5" />,
          isActive: pathname === "/dashboard/registration-reports",
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

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      close()
    }
  }

  return (
    <Sidebar
      className={`fixed top-14 h-[calc(100vh-3.5rem)] z-40 transition-all duration-300 ease-in-out ${isOpen ? "left-0" : "-left-64 md:left-0"} w-64 bg-gradient-to-b from-purple-900 to-purple-950 border-r border-purple-800`}
    >
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
                      <Link href={item.href} className="flex items-center gap-3 px-3 py-2" onClick={handleLinkClick}>
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
