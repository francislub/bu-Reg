"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { getActiveSemester } from "@/lib/actions/semester-actions"
import { getRegistrationCard } from "@/lib/actions/registration-actions"
import { getStudentRegisteredCourses } from "@/lib/actions/course-registration-actions"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"

export default function RegistrationCardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeSemester, setActiveSemester] = useState<any>(null)
  const [registrationCard, setRegistrationCard] = useState<any>(null)
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)

        // Get active semester
        const semesterResult = await getActiveSemester()
        if (semesterResult.success) {
          setActiveSemester(semesterResult.semester)

          // Get registration card
          const cardResult = await getRegistrationCard(session.user.id, semesterResult.semester.id)
          if (cardResult.success) {
            setRegistrationCard(cardResult.registrationCard)

            // Get registered courses
            const coursesResult = await getStudentRegisteredCourses(session.user.id, semesterResult.semester.id)
            if (coursesResult.success) {
              setRegisteredCourses(coursesResult.courseUploads)
            }
          } else {
            toast({
              title: "No Registration Card",
              description: "You don't have a registration card for the current semester.",
              variant: "destructive",
            })
            router.push("/dashboard/registration")
          }
        } else {
          toast({
            title: "No Active Semester",
            description: "There is no active semester at the moment.",
            variant: "destructive",
          })
          router.push("/dashboard/registration")
        }
      } catch (error) {
        console.error("Error fetching registration card data:", error)
        toast({
          title: "Error",
          description: "Failed to load registration card data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, router, toast])

  return (
    <DashboardShell>
      <DashboardHeader heading="Registration Card" text="View and print your registration card.">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : registrationCard ? (
        <PrintRegistrationCard registrationCard={registrationCard} courses={registeredCourses} />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No Registration Card Available</h3>
          <p className="text-muted-foreground mt-2">You don't have a registration card for the current semester.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/registration")}>
            Go to Registration
          </Button>
        </div>
      )}
    </DashboardShell>
  )
}
