"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { BookOpen, Calendar, CheckSquare, ClipboardList, Home, Settings, User } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold">Bugema University</span>
          </Link>
        </div>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(userRole))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent" : "transparent",
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
