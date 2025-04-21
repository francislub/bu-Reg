import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { MobileNav } from "@/components/dashboard/mobile-nav"

interface SiteHeaderProps {
  children?: React.ReactNode
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <MobileNav />
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Bugema University Logo" width={40} height={40} className="rounded-full" />
            <span className="font-bold hidden md:inline-block">Bugema University</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">{children}</div>
      </div>
    </header>
  )
}
