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
      phone?: string | null
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
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .print-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: white !important;
          font-size: 12px !important;
          line-height: 1.3 !important;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .print-logo {
          max-height: 60px !important;
          width: auto !important;
        }
        .print-title {
          font-size: 18px !important;
          font-weight: bold;
          margin: 8px 0 !important;
        }
        .print-subtitle {
          font-size: 14px !important;
          margin: 4px 0 !important;
        }
        .print-info-grid {
          display: grid !important;
          grid-template-columns: 2fr 1fr !important;
          gap: 15px !important;
          margin-bottom: 20px !important;
        }
        .print-info-section {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 10px !important;
        }
        .print-info-item {
          margin-bottom: 8px !important;
        }
        .print-info-label {
          font-size: 10px !important;
          color: #666 !important;
          margin-bottom: 2px !important;
        }
        .print-info-value {
          font-weight: 500 !important;
          font-size: 11px !important;
        }
        .print-photo-container {
          border: 1px solid #ddd !important;
          padding: 4px !important;
          background-color: #f9f9f9 !important;
          text-align: center !important;
          height: fit-content !important;
        }
        .print-photo {
          width: 100px !important;
          height: 120px !important;
          object-fit: cover !important;
        }
        .print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-bottom: 15px !important;
          font-size: 10px !important;
        }
        .print-table th,
        .print-table td {
          border: 1px solid #ddd !important;
          padding: 4px !important;
          text-align: left !important;
        }
        .print-table th {
          background-color: #f2f2f2 !important;
          font-weight: bold !important;
          font-size: 10px !important;
        }
        .print-section-title {
          font-size: 14px !important;
          font-weight: bold !important;
          margin: 15px 0 8px 0 !important;
          border-bottom: 1px solid #ddd !important;
          padding-bottom: 3px !important;
        }
        .print-signatures {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 30px !important;
          margin-top: 30px !important;
        }
        .print-signature-line {
          border-top: 1px dashed #000 !important;
          padding-top: 4px !important;
          text-align: center !important;
          font-size: 10px !important;
        }
        .print-footer {
          margin-top: 20px !important;
          font-size: 9px !important;
          color: #666 !important;
        }
        .print-status-badge {
          padding: 2px 6px !important;
          border-radius: 8px !important;
          font-size: 9px !important;
          font-weight: 500 !important;
        }
        .print-status-approved {
          background-color: #d1fae5 !important;
          color: #065f46 !important;
        }
        .print-status-pending {
          background-color: #fef3c7 !important;
          color: #92400e !important;
        }
        .print-status-rejected {
          background-color: #fee2e2 !important;
          color: #b91c1c !important;
        }
        .print-total-row {
          background-color: #f9f9f9 !important;
          font-weight: bold !important;
        }
        .print-warning {
          color: #92400e !important;
          font-weight: bold !important;
          font-size: 10px !important;
        }
      }
    `,
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
      <div className="flex justify-between items-center no-print">
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
        <Alert variant="warning" className="mb-4 no-print">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Approval</AlertTitle>
          <AlertDescription>
            This registration card contains courses that are still pending approval. The final approved card may differ.
          </AlertDescription>
        </Alert>
      )}

      <div ref={printRef} className="print-container bg-white p-6 rounded-lg border shadow-sm">
        {/* Header */}
        <div className="print-header text-center mb-6">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="Bugema University Logo"
              className="print-logo h-16 w-auto"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                e.currentTarget.alt = "University Logo"
              }}
            />
          </div>
          <h1 className="print-title text-2xl font-bold">BUGEMA UNIVERSITY</h1>
          <p className="print-subtitle text-lg font-semibold">STUDENT REGISTRATION CARD</p>
          <p className="print-subtitle text-md">
            {registration.semester.name} - {registration.semester.academicYear.name}
          </p>
          {isPending && (
            <p className="print-warning text-sm text-amber-600 font-medium mt-1">PROVISIONAL - PENDING APPROVAL</p>
          )}
        </div>

        {/* Student Information */}
        <div className="print-info-grid grid md:grid-cols-3 gap-4 mb-6">
          <div className="print-info-section md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="print-info-item">
                <div className="print-info-label text-sm text-gray-500">Student Name</div>
                <div className="print-info-value font-medium">
                  {registration.user.profile?.firstName || ""} {registration.user.profile?.lastName || ""}
                </div>
              </div>
              <div className="print-info-item">
                <div className="print-info-label text-sm text-gray-500">Student ID</div>
                <div className="print-info-value font-medium">
                  {registration.user.profile?.studentId || registration.user.id}
                </div>
              </div>
              <div className="print-info-item">
                <div className="print-info-label text-sm text-gray-500">Program</div>
                <div className="print-info-value font-medium">
                  {registration.user.profile?.program || "Not specified"}
                </div>
              </div>
              <div className="print-info-item">
                <div className="print-info-label text-sm text-gray-500">Registration Date</div>
                <div className="print-info-value font-medium">
                  {new Date(registration.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="print-info-item">
                <div className="print-info-label text-sm text-gray-500">Email</div>
                <div className="print-info-value font-medium">{registration.user.email || "N/A"}</div>
              </div>
              <div className="print-info-item">
                <div className="print-info-label text-sm text-gray-500">Registration Status</div>
                <div className="print-info-value font-medium">
                  <span
                    className={`print-status-badge px-2 py-1 rounded-full text-xs ${
                      registration.status === "APPROVED"
                        ? "print-status-approved bg-green-100 text-green-800"
                        : registration.status === "REJECTED"
                          ? "print-status-rejected bg-red-100 text-red-800"
                          : "print-status-pending bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {registration.status}
                  </span>
                </div>
              </div>
              {registration.user.profile?.phone && (
                <div className="print-info-item">
                  <div className="print-info-label text-sm text-gray-500">Phone Number</div>
                  <div className="print-info-value font-medium">{registration.user.profile.phone}</div>
                </div>
              )}
              {registration.registrationCard && (
                <div className="print-info-item">
                  <div className="print-info-label text-sm text-gray-500">Card Number</div>
                  <div className="print-info-value font-medium">{registration.registrationCard.cardNumber}</div>
                </div>
              )}
            </div>
          </div>
          <div className="print-photo-container flex justify-center items-start">
            <div className="border p-1 bg-gray-50">
              <img
                src={registration.user.profile?.photoUrl || "/placeholder.svg?height=120&width=100"}
                alt="Student Photo"
                className="print-photo h-[120px] w-[100px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=120&width=100"
                }}
              />
            </div>
          </div>
        </div>

        {/* Registered Courses */}
        <div className="mb-4">
          <h3 className="print-section-title text-lg font-semibold mb-2">Registered Courses</h3>
          <table className="print-table w-full border-collapse">
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
                        className={`print-status-badge px-2 py-1 rounded-full text-xs ${
                          upload.status === "APPROVED"
                            ? "print-status-approved bg-green-100 text-green-800"
                            : upload.status === "REJECTED"
                              ? "print-status-rejected bg-red-100 text-red-800"
                              : "print-status-pending bg-yellow-100 text-yellow-800"
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
              <tr className="print-total-row bg-gray-50">
                <td colSpan={3} className="border p-2 text-right font-semibold">
                  Total Credit Hours:
                </td>
                <td className="border p-2 text-center font-semibold">{totalCreditHours}</td>
                <td className="border p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="print-signatures grid grid-cols-2 gap-8 mt-8">
          <div>
            <div className="print-signature-line border-t border-dashed pt-2">
              <p className="text-center">Student Signature</p>
            </div>
          </div>
          <div>
            <div className="print-signature-line border-t border-dashed pt-2">
              <p className="text-center">Registrar Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="print-footer mt-8 text-xs text-gray-500">
          <p>This registration card is an official document of Bugema University. Any alteration renders it invalid.</p>
          <p>Printed on: {new Date().toLocaleString()}</p>
          {isPending && (
            <p className="print-warning text-amber-600 font-medium mt-1">
              PROVISIONAL COPY - This card is pending final approval from the registrar's office.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
