import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{ expanded: boolean }>({ expanded: true })

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("w-64 border-r bg-background", className)} {...props}>
    {children}
  </div>
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-t", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1 p-2", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement | HTMLDivElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.HTMLAttributes<HTMLDivElement> & {
      isActive?: boolean
      asChild?: boolean
    }
>(({ className, isActive, asChild = false, ...props }, ref) => {
  const Comp = (asChild ? "div" : "button") as React.ElementType
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement | HTMLDivElement>}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  return <SidebarContext.Provider value={{ expanded: true }}>{children}</SidebarContext.Provider>
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
}
