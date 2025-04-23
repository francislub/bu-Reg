"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu)
  }

  const academicsLinks = [
    { title: "Undergraduate Programs", href: "/academics/undergraduate", description: "Bachelor's degree programs" },
    { title: "Graduate Programs", href: "/academics/graduate", description: "Master's and doctoral programs" },
    { title: "Diploma Programs", href: "/academics/diploma", description: "Diploma and certificate courses" },
    { title: "Distance Learning", href: "/academics/distance", description: "Online and distance education options" },
    { title: "Academic Calendar", href: "/academics/calendar", description: "Important dates and schedules" },
    { title: "Faculty & Staff", href: "/academics/faculty", description: "Meet our distinguished faculty" },
  ]

  const admissionsLinks = [
    { title: "Admission Requirements", href: "/admissions/requirements", description: "Eligibility criteria" },
    { title: "Application Process", href: "/admissions/process", description: "Step-by-step application guide" },
    { title: "Tuition & Fees", href: "/admissions/tuition", description: "Cost information and payment plans" },
    { title: "Scholarships", href: "/admissions/scholarships", description: "Financial aid opportunities" },
    {
      title: "International Students",
      href: "/admissions/international",
      description: "Information for foreign students",
    },
    { title: "Transfer Students", href: "/admissions/transfer", description: "Credit transfer policies" },
  ]

  const campusLifeLinks = [
    { title: "Housing & Accommodation", href: "/campus-life/housing", description: "On-campus living options" },
    { title: "Student Organizations", href: "/campus-life/organizations", description: "Clubs and associations" },
    { title: "Sports & Recreation", href: "/sports", description: "Athletic programs and facilities" },
    { title: "Dining Services", href: "/campus-life/dining", description: "Campus food options" },
    { title: "Health & Wellness", href: "/campus-life/health", description: "Health services and counseling" },
    { title: "Campus Events", href: "/campus-life/events", description: "Activities and events calendar" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/bugema.png" alt="Bugema University Logo" width={50} height={50} className="rounded-full" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-[#1e3a8a]">BUGEMA UNIVERSITY</h1>
                <p className="text-xs text-gray-600">Excellence in Service</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>About</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Academics</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {academicsLinks.map((link) => (
                        <li key={link.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{link.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Admissions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {admissionsLinks.map((link) => (
                        <li key={link.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{link.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Campus Life</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {campusLifeLinks.map((link) => (
                        <li key={link.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{link.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden md:block">
              <Button variant="outline" className="bg-white text-[#1e3a8a] hover:bg-gray-100">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-yellow-500 text-[#1e3a8a] hover:bg-yellow-400">Apply Now</Button>
            </Link>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] lg:hidden">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b pb-4">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Image
                        src="/logo.png"
                        alt="Bugema University Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span className="font-bold">Bugema University</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <nav className="flex-1 overflow-auto py-6">
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/"
                          className={cn(
                            "flex items-center py-2 px-3 rounded-md hover:bg-gray-100",
                            isActive("/") && "font-medium text-[#1e3a8a]",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/about"
                          className={cn(
                            "flex items-center py-2 px-3 rounded-md hover:bg-gray-100",
                            isActive("/about") && "font-medium text-[#1e3a8a]",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          About
                        </Link>
                      </li>
                      <li>
                        <button
                          className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-gray-100"
                          onClick={() => toggleSubmenu("academics")}
                        >
                          <span>Academics</span>
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform", openSubmenu === "academics" && "rotate-180")}
                          />
                        </button>
                        {openSubmenu === "academics" && (
                          <ul className="pl-6 mt-1 space-y-1">
                            {academicsLinks.map((link) => (
                              <li key={link.title}>
                                <Link
                                  href={link.href}
                                  className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {link.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                      <li>
                        <button
                          className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-gray-100"
                          onClick={() => toggleSubmenu("admissions")}
                        >
                          <span>Admissions</span>
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform", openSubmenu === "admissions" && "rotate-180")}
                          />
                        </button>
                        {openSubmenu === "admissions" && (
                          <ul className="pl-6 mt-1 space-y-1">
                            {admissionsLinks.map((link) => (
                              <li key={link.title}>
                                <Link
                                  href={link.href}
                                  className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {link.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                      <li>
                        <button
                          className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-gray-100"
                          onClick={() => toggleSubmenu("campus")}
                        >
                          <span>Campus Life</span>
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform", openSubmenu === "campus" && "rotate-180")}
                          />
                        </button>
                        {openSubmenu === "campus" && (
                          <ul className="pl-6 mt-1 space-y-1">
                            {campusLifeLinks.map((link) => (
                              <li key={link.title}>
                                <Link
                                  href={link.href}
                                  className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {link.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                      <li>
                        <Link
                          href="/contact"
                          className={cn(
                            "flex items-center py-2 px-3 rounded-md hover:bg-gray-100",
                            isActive("/contact") && "font-medium text-[#1e3a8a]",
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </nav>

                  <div className="border-t pt-4 space-y-2">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-yellow-500 text-[#1e3a8a] hover:bg-yellow-400">Apply Now</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
