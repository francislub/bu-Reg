import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SiteLayout } from "@/components/site/site-layout"

interface AcademicsLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  breadcrumbTitle: string
}

export function AcademicsLayout({ children, title, description, breadcrumbTitle }: AcademicsLayoutProps) {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-xl mb-6">{description}</p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-blue-700 hover:underline">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/academics" className="text-blue-700 hover:underline">
              Academics
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>{breadcrumbTitle}</span>
          </div>
        </div>
      </div>

      {/* Sidebar Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">Academic Programs</h3>
              <nav className="space-y-2">
                <Link
                  href="/academics/undergraduate"
                  className="block py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Undergraduate Programs
                </Link>
                <Link
                  href="/academics/graduate"
                  className="block py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Graduate Programs
                </Link>
                <Link
                  href="/academics/distance"
                  className="block py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Distance Learning
                </Link>
                <Link
                  href="/academics/diploma"
                  className="block py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Diploma Programs
                </Link>
                <Link
                  href="/academics/faculty"
                  className="block py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Faculty & Staff
                </Link>
                <Link
                  href="/academics/calendar"
                  className="block py-2 px-3 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  Academic Calendar
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </SiteLayout>
  )
}
