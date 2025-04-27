"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Printer, Download, Loader2 } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { RegistrationSlip } from "@/components/dashboard/registration-slip"

export default function PrintRegistrationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<string>("")
  const [registrationData, setRegistrationData] = useState<any>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/registrations?userId=${session.user.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Only show approved registrations
            const approvedRegistrations = data.registrations.filter(
              (registration: any) => registration.status === "APPROVED",
            )
            setRegistrations(approvedRegistrations)

            // Set default selection to the most recent registration
            if (approvedRegistrations.length > 0) {
              setSelectedRegistration(approvedRegistrations[0].id)
            }
          } else {
            toast({
              title: "Error",
              description: data.message || "Failed to fetch registrations",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch registrations",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching registrations:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrations()
  }, [session, toast])

  useEffect(() => {
    const fetchRegistrationData = async () => {
      if (!selectedRegistration) {
        setRegistrationData(null)
        return
      }

      try {
        const response = await fetch(`/api/registrations/${selectedRegistration}/details`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRegistrationData(data.registration)
          } else {
            toast({
              title: "Error",
              description: data.message || "Failed to fetch registration details",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch registration details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching registration details:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchRegistrationData()
  }, [selectedRegistration, toast])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Registration_Slip_${new Date().toISOString().split("T")[0]}`,
    onBeforeGetContent: () => {
      if (!registrationData) {
        toast({
          title: "Error",
          description: "No registration data to print",
          variant: "destructive",
        })
        return Promise.reject()
      }
      return Promise.resolve()
    },
    onPrintError: () => {
      toast({
        title: "Error",
        description: "Failed to print registration slip",
        variant: "destructive",
      })
    },
    removeAfterPrint: true,
  })

  const handleDownloadPDF = async () => {
    if (!registrationData) {
      toast({
        title: "Error",
        description: "No registration data to download",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/registrations/${selectedRegistration}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Registration_Slip_${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast({
          title: "Error",
          description: "Failed to download registration slip",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error downloading registration slip:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Print Registration Slip" text="Print or download your registration slip">
        {registrationData && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="default" onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        )}
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {registrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You don't have any approved registrations. Please complete the registration process first.
                  </p>
                  <Button className="mt-4" onClick={() => router.push("/dashboard/registration")}>
                    Go to Registration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registration">Select Registration</Label>
                    <Select value={selectedRegistration} onValueChange={setSelectedRegistration}>
                      <SelectTrigger id="registration">
                        <SelectValue placeholder="Select a registration" />
                      </SelectTrigger>
                      <SelectContent>
                        {registrations.map((registration) => (
                          <SelectItem key={registration.id} value={registration.id}>
                            {registration.semester.name}, {registration.semester.academicYear.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {registrationData && (
            <div className="hidden">
              <div ref={printRef}>
                <RegistrationSlip data={registrationData} />
              </div>
            </div>
          )}

          {registrationData && (
            <Card>
              <CardContent className="pt-6">
                <RegistrationSlip data={registrationData} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
