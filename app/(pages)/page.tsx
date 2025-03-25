import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If user is logged in, redirect to the appropriate dashboard
  let dashboardLink = "/auth/login"

  if (session) {
    if (session.user.role === "ADMIN") {
      dashboardLink = "/admin/dashboard"
    } else if (session.user.role === "FACULTY") {
      dashboardLink = "/faculty/dashboard"
    } else {
      dashboardLink = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/bugema.png" alt="Bugema University Logo" width={50} height={50} className="mr-3" />
            <h1 className="text-2xl font-bold text-blue-900">Bugema University</h1>
          </div>

          {session ? (
            <Button asChild>
              <Link href={dashboardLink}>Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🔒</span> Student Login
              </CardTitle>
              <CardDescription>
                Access your student portal to register for courses and view your academic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild className="w-full">
                <Link href="/auth/login">Login to Portal</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📢</span> Latest Notification
              </CardTitle>
              <CardDescription>Stay updated with the latest announcements from the university</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-100 text-red-800 p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Notification List Empty!
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/auth/signup?role=student">Student Sign Up</Link>
              </Button>
              <Button variant="outline" asChild className="bg-orange-500 text-white hover:bg-orange-600">
                <Link href="/auth/signup?role=faculty">Faculty Sign Up</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="bg-white shadow-inner mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>::Flair - ERMS:: Bugema University:: Student Portal © 2025 All Rights Reserved. Version 2.0</p>
        </div>
      </footer>
    </div>
  )
}

