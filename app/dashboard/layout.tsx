import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SiteHeader } from "@/components/dashboard/site-header"
import { UserAccountNav } from "@/components/dashboard/user-account-nav"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MainNav } from "@/components/dashboard/main-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader>
          <MainNav />
          <UserAccountNav
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }}
          />
        </SiteHeader>
        <div className="flex flex-1 relative">
          <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-30 w-64 bg-black">
            <DashboardSidebar />
          </div>
          <div className="pl-0 md:pl-64 w-full">
            <main className="flex w-full flex-1 flex-col overflow-hidden p-6">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
