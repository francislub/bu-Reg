"use client"

import Image from "next/image"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function StudentLoginPage() {
  const { login, isLoading } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    await login({
      email: data.email,
      password: data.password,
      expectedRole: "STUDENT",
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center">
            <Image src="/images/bugema.png" alt="Bugema University Logo" width={50} height={50} className="mr-3" />
            <h1 className="text-2xl font-bold text-blue-900">Bugema University</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🔒</span> Student Login
              </CardTitle>
              <CardDescription>Enter your credentials to access your student portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
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

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration No / Email ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center w-full">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
                {" | "}
                <Link href="/auth/resend-verification" className="text-blue-600 hover:underline">
                  Resend Email ID Verification
                </Link>
              </div>

              <div className="flex justify-between w-full">
                <Button variant="outline" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" asChild className="bg-orange-500 text-white hover:bg-orange-600">
                  <Link href="/auth/new-student">New Student</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🏢</span> Staff Portal
              </CardTitle>
              <CardDescription>Access portals for faculty and administrative staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Faculty Members</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Access your teaching schedule, student lists, and grade submission portal.
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/auth/faculty">Faculty Login</Link>
                </Button>
              </div>

              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-medium text-purple-800 mb-2">Administrators</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Access system management, reports, and administrative functions.
                </p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/auth/admin">Admin Login</Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full text-gray-600">
                For technical support, please contact the IT department at{" "}
                <a href="mailto:it@bugema.ac.ug" className="text-blue-600 hover:underline">
                  it@bugema.ac.ug
                </a>
              </div>
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

