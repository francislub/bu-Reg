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
import { getPublishedTimetable } from "@/lib/actions/timetable-actions"
import { PrintTimetable } from "@/components/dashboard/print-timetable"

export default function PrintTimetablePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeSemester, setActiveSemester] = useState<any>(null)
  const [timetable, setTimetable] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Get active semester
        const semesterResult = await getActiveSemester()
        if (semesterResult.success) {
          setActiveSemester(semesterResult.semester)

          // Get published timetable for this semester
          const timetableResult = await getPublishedTimetable(semesterResult.semester.id)
          if (timetableResult.success) {
            setTimetable(timetableResult.timetable)
          } else {
            toast({
              title: "Timetable Not Available",
              description: "No published timetable found for the current semester.",
              variant: "destructive",
            })
            router.push("/dashboard/timetable")
          }
        } else {
          toast({
            title: "No Active Semester",
            description: "There is no active semester at the moment.",
            variant: "destructive",
          })
          router.push("/dashboard/timetable")
        }
      } catch (error) {
        console.error("Error fetching timetable data:", error)
        toast({
          title: "Error",
          description: "Failed to load timetable data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  return (
    <DashboardShell>
      <DashboardHeader heading="Print Timetable" text="Print your class schedule.">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : timetable ? (
        <PrintTimetable timetable={timetable} studentName={session?.user?.name || undefined} />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No Timetable Available</h3>
          <p className="text-muted-foreground mt-2">No published timetable is available for the current semester.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/timetable")}>
            Go to Timetable
          </Button>
        </div>
      )}
    </DashboardShell>
  )
}
