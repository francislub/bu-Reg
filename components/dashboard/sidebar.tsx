"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "next-auth"
import { BookOpen, Calendar, CreditCard, FileText, GraduationCap, Home, Library, UserIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface DashboardSidebarProps {
  user: User
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: UserIcon,
    },
    {
      title: "Registration",
      href: "/dashboard/registration",
      icon: BookOpen,
    },
    {
      title: "Class Permit",
      href: "/dashboard/class-permit",
      icon: Calendar,
    },
    {
      title: "Fee Details",
      href: "/dashboard/fee-details",
      icon: CreditCard,
    },
    {
      title: "Exam Clearance",
      href: "/dashboard/exam-clearance",
      icon: FileText,
    },
    {
      title: "Library",
      href: "/dashboard/library",
      icon: Library,
    },
    {
      title: "Mid Semester Clearance",
      href: "/dashboard/mid-semester-clearance",
      icon: FileText,
    },
    {
      title: "Mid Semester Pass Slip",
      href: "/dashboard/mid-semester-pass-slip",
      icon: FileText,
    },
    {
      title: "Transcript",
      href: "/dashboard/transcript",
      icon: FileText,
    },
    {
      title: "Grade Slip",
      href: "/dashboard/grade-slip",
      icon: FileText,
    },
    {
      title: "Graduation",
      href: "/dashboard/graduation",
      icon: GraduationCap,
    },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <div className="flex flex-col items-center justify-center p-2">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <UserIcon className="h-8 w-8 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">BCC</p>
                <Link href="/dashboard/profile/change-password" className="text-xs text-blue-500 hover:underline">
                  Change Password
                </Link>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4 text-xs text-center text-gray-500">Last Login: {new Date().toLocaleString()}</div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

