"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { getRoleBasedRedirect } from "@/lib/auth-service"
import type { UserRole } from "@prisma/client"

interface LoginHandlerProps {
  email: string
  password: string
  expectedRole?: UserRole
  onSuccess?: (redirectUrl: string) => void
  onError?: (error: string) => void
  onComplete?: () => void
}

export function useLoginHandler() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async ({ email, password, expectedRole, onSuccess, onError, onComplete }: LoginHandlerProps) => {
    setIsLoading(true)

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (response?.error) {
        const errorMessage =
          response.error === "CredentialsSignin" ? "Invalid email or password. Please try again." : response.error

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        })

        if (onError) onError(errorMessage)
        return
      }

      // Fetch user data to get role
      const userResponse = await fetch("/api/auth/me")
      const userData = await userResponse.json()

      // Check if user has the expected role
      if (expectedRole && userData.role !== expectedRole) {
        toast({
          title: "Access Denied",
          description: `This login is for ${expectedRole.toLowerCase()} accounts only. Please use the appropriate login page.`,
          variant: "destructive",
        })

        if (onError) onError("Access Denied")
        return
      }

      // Get redirect URL based on role
      const redirectUrl = await getRoleBasedRedirect(userData.role)

      toast({
        title: "Login Successful",
        description: `Welcome back to Bugema University ${userData.role.toLowerCase()} portal!`,
      })

      if (onSuccess) {
        onSuccess(redirectUrl)
      } else {
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })

      if (onError) onError("Something went wrong")
    } finally {
      setIsLoading(false)
      if (onComplete) onComplete()
    }
  }

  return { handleLogin, isLoading }
}

