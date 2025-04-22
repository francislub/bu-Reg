import type React from "react"
import { MainNav } from "@/components/dashboard/main-nav"

interface SiteHeaderProps {
  children?: React.ReactNode
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">{children}</div>
      </div>
    </header>
  )
}
