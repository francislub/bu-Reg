"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useSidebarStore } from "@/lib/stores/sidebar-store"

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden">
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
