import type React from "react"
import { cn } from "@/lib/utils"
// import { MainNav } from "@/components/dashboard/main-nav"

interface SiteHeaderProps {
  children?: React.ReactNode
  className?: string
}

export function SiteHeader({ children, className }: SiteHeaderProps) {
  return (
    <header className={cn("bg-background border-b h-14 flex items-center px-4", className)}>
      <div className="flex w-full justify-between items-center">
        {children}
      </div>
    </header>
  )
}
