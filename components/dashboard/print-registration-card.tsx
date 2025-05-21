"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Registration = {
  id: string
  userId: string
  semesterId: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    profile: {
      firstName?: string | null
      lastName?: string | null
      studentId?: string | null
      program?: string | null
      phoneNumber?: string | null
      photoUrl?: string | null
      academicInfo?: {
        gpa?: string | null
        standing?: string | null
        yearOfStudy?: string | null
      } | null
    }
  }
  semester: {
    id: string
    name: string
    startDate: string
    endDate: string
    academicYear: {
      name: string
    }
  }
  courseUploads: {
    id: string
    courseId: string
    status: string
    course: {
      id: string
      code: string
      title: string
      credits: number
      department: {
        id: string
        name: string
      }
    }
  }[]
  paymentStatus?: string
  amountPaid?: string
  registrationCard?: {
    cardNumber: string
  } | null
}

export function PrintRegistrationCard({ registration }: { registration: Registration }) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Registration_Card_${registration.user.profile?.studentId || registration.user.id}`,
    onBeforeGetContent: () => {
      setIsGenerating(true)
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    },
    onAfterPrint: () => {
      setIsGenerating(false)
      toast({
        title: "Success",
        description: "Registration card printed successfully",
      })
    },
    onPrintError: (error) => {
      setIsGenerating(false)
      console.error("Print error:", error)
      toast({
        title: "Error",
        description: "Failed to print registration card",
        variant: "destructive",
      })
    },
  })

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      // Make sure we have a registration ID
      if (!registration.id || registration.id === "temp-id") {
        throw new Error("Valid registration ID is required for PDF download")
      }

      const response = await fetch(`/api/registrations/${registration.id}/pdf`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate PDF: ${errorText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Registration_Card_${registration.user.profile?.studentId || registration.user.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Registration card downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: `Failed to download registration card: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate total credit hours
  const totalCreditHours = registration.courseUploads.reduce((total, upload) => total + (upload.course.credits || 0), 0)

  // Check if registration is pending or has pending courses
  const isPending =
    registration.status === "PENDING" || registration.courseUploads.some((upload) => upload.status === "PENDING")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Registration Card</h2>
        <div className="flex space-x-2">
          <Button onClick={handlePrint} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGenerating || registration.id === "temp-id"}
            title={registration.id === "temp-id" ? "PDF download requires a saved registration" : "Download as PDF"}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {isPending && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Approval</AlertTitle>
          <AlertDescription>
            This registration card contains courses that are still pending approval. The final approved card may differ.
          </AlertDescription>
        </Alert>
      )}

      <div ref={printRef} className="bg-white p-8 rounded-lg border shadow-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Bugema University Logo"
              className="h-16 w-auto"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                e.currentTarget.alt = "University Logo"
              }}
            />
          </div>
          <h1 className="text-2xl font-bold">BUGEMA UNIVERSITY</h1>
          <p className="text-lg font-semibold">STUDENT REGISTRATION CARD</p>
          <p className="text-md">
            {registration.semester.name} - {registration.semester.academicYear.name}
          </p>
          {isPending && <p className="text-sm text-amber-600 font-medium mt-1">PROVISIONAL - PENDING APPROVAL</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-medium">
                  {registration.user.profile?.firstName || ""} {registration.user.profile?.lastName || ""}
                </p>
              </div>
              {/* <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium">{registration.user.profile?.studentId || registration.user.id}</p>
              </div> */}
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p className="font-medium">{registration.user.profile?.program || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Date</p>
                <p className="font-medium">{new Date(registration.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{registration.user.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Status</p>
                <p
                  className={`font-medium ${
                    registration.status === "APPROVED"
                      ? "text-green-600"
                      : registration.status === "REJECTED"
                        ? "text-red-600"
                        : "text-amber-600"
                  }`}
                >
                  {registration.status}
                </p>
              </div>
              {registration.user.profile?.phoneNumber && (
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{registration.user.profile.phoneNumber}</p>
                </div>
              )}
              {registration.registrationCard && (
                <div>
                  <p className="text-sm text-gray-500">Card Number</p>
                  <p className="font-medium">{registration.registrationCard.cardNumber}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center items-start">
            <div className="border p-1 bg-gray-50">
              <img
                src={registration.user.profile?.photoUrl || "/placeholder.svg?height=150&width=120"}
                alt="Student Photo"
                className="h-[150px] w-[120px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=150&width=120"
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Registered Courses</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Course Code</th>
                <th className="border p-2 text-left">Course Title</th>
                <th className="border p-2 text-left">Department</th>
                <th className="border p-2 text-center">Credits</th>
                <th className="border p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {registration.courseUploads.length > 0 ? (
                registration.courseUploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="border p-2">{upload.course.code}</td>
                    <td className="border p-2">{upload.course.title}</td>
                    <td className="border p-2">{upload.course.department?.name || "N/A"}</td>
                    <td className="border p-2 text-center">{upload.course.credits}</td>
                    <td className="border p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          upload.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : upload.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {upload.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">
                    No courses registered yet
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td colSpan={3} className="border p-2 text-right font-semibold">
                  Total Credit Hours:
                </td>
                <td className="border p-2 text-center font-semibold">{totalCreditHours}</td>
                <td className="border p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {registration.user.profile?.academicInfo && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Academic Information</h3>
            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded border">
              <div>
                <p className="text-sm text-gray-500">Current GPA</p>
                <p className="font-medium">{registration.user.profile.academicInfo.gpa || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Academic Standing</p>
                <p className="font-medium">{registration.user.profile.academicInfo.standing || "Good Standing"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year of Study</p>
                <p className="font-medium">{registration.user.profile.academicInfo.yearOfStudy || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
          <div className="bg-gray-50 p-4 rounded border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-medium">{registration.paymentStatus || "Pending"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-medium">{registration.amountPaid || "0.00"} UGX</p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <div className="border-t border-dashed pt-2">
              <p className="text-center">Student Signature</p>
            </div>
          </div>
          <div>
            <div className="border-t border-dashed pt-2">
              <p className="text-center">Registrar Signature</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-500">
          <p>This registration card is an official document of Bugema University. Any alteration renders it invalid.</p>
          <p>Printed on: {new Date().toLocaleString()}</p>
          {isPending && (
            <p className="text-amber-600 font-medium mt-1">
              PROVISIONAL COPY - This card is pending final approval from the registrar's office.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
