"use client"

import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden" 
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
