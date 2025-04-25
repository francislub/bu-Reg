"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { useEffect } from "react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/users/${session.user.id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          console.error("Error fetching user profile:", data.message)
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Profile" text="Loading your profile..." />
        <div>Loading...</div>
      </DashboardShell>
    )
  }

  if (!user) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Profile" text="Error loading your profile." />
        <div>Error loading profile. Please try again later.</div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings." />
      <ProfileForm initialData={user} />
    </DashboardShell>
  )
}
