"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface LoginProps {
  email: string
  password: string
  expectedRole?: "STUDENT" | "FACULTY" | "ADMIN"
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  const login = async ({ email, password, expectedRole }: LoginProps) => {
    setIsLoading(true)

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (response?.error) {
        toast({
          title: "Login Failed",
          description: response.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return false
      }

      // Refresh the session
      router.refresh()

      // Get role-specific welcome messages
      const welcomeMessages = {
        STUDENT: "Welcome to your student portal!",
        FACULTY: "Welcome to the faculty portal!",
        ADMIN: "Welcome to the administration portal!",
      }

      // Get role-specific redirect URLs
      const redirectUrls = {
        STUDENT: "/dashboard/student",
        FACULTY: "/faculty/dashboard",
        ADMIN: "/admin/dashboard",
      }

      // Use the session data to determine the role
      // This will be available after router.refresh()
      setTimeout(() => {
        if (session?.user?.role) {
          const userRole = session.user.role as keyof typeof welcomeMessages

          // Check if the user has the expected role
          if (expectedRole && userRole !== expectedRole) {
            toast({
              title: "Access Denied",
              description: `This login is for ${expectedRole.toLowerCase()} accounts only. Please use the appropriate login page.`,
              variant: "destructive",
            })

            // Sign out the user
            signIn("credentials", { redirect: false, email: "", password: "" })
            setIsLoading(false)
            return false
          }

          toast({
            title: "Login Successful",
            description: welcomeMessages[userRole] || "Welcome back!",
          })

          // Redirect based on role
          router.push(redirectUrls[userRole] || "/dashboard")
        } else {
          // If we can't determine the role, redirect to a general page
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          })
          router.push("/dashboard/redirect")
        }

        setIsLoading(false)
      }, 500) // Small delay to ensure session is updated

      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })
      setIsLoading(false)
      return false
    }
  }

  return { login, isLoading }
}

