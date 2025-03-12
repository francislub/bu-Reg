"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/login")
      return
    }

    // Redirect based on user role
    if (session.user.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else if (session.user.role === "FACULTY") {
      router.push("/faculty/dashboard")
    } else {
      router.push("/dashboard/student")
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Redirecting to your dashboard...</p>
    </div>
  )
}

