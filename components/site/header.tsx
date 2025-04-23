"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/bugema.png" alt="Bugema University Logo" width={40} height={40} className="h-10 w-auto" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold">Bugema University</h1>
            <p className="text-xs">Excellence in Service</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="group flex items-center space-x-1 p-0">
                <span className="text-sm font-medium group-hover:text-primary">About</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem asChild>
                <Link href="/about">About Us</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/history">History</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/leadership">Leadership</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/campus">Campus Tour</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="group flex items-center space-x-1 p-0">
                <span className="text-sm font-medium group-hover:text-primary">Academics</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem asChild>
                <Link href="/academics/programs">Programs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/academics/faculties">Faculties</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/academics/calendar">Academic Calendar</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admissions" className="text-sm font-medium hover:text-primary">
            Admissions
          </Link>

          <Link href="/students" className="text-sm font-medium hover:text-primary">
            Students
          </Link>

          <Link href="/sports" className="text-sm font-medium hover:text-primary">
            Sports
          </Link>

          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex md:items-center md:space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Apply Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container mx-auto px-4 md:hidden">
          <nav className="flex flex-col space-y-4 py-4">
            <Link href="/" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
              Home
            </Link>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium hover:text-primary">
                About
                <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                <Link href="/about" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  About Us
                </Link>
                <Link href="/about/history" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  History
                </Link>
                <Link href="/about/leadership" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  Leadership
                </Link>
                <Link href="/about/campus" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  Campus Tour
                </Link>
              </div>
            </details>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium hover:text-primary">
                Academics
                <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                <Link href="/academics/programs" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  Programs
                </Link>
                <Link href="/academics/faculties" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  Faculties
                </Link>
                <Link href="/academics/calendar" className="text-sm hover:text-primary" onClick={toggleMenu}>
                  Academic Calendar
                </Link>
              </div>
            </details>
            <Link href="/admissions" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
              Admissions
            </Link>
            <Link href="/students" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
              Students
            </Link>
            <Link href="/sports" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
              Sports
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
              Contact
            </Link>
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/auth/login" onClick={toggleMenu}>
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/auth/register" onClick={toggleMenu}>
                  Apply Now
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
