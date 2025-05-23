"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

  // Calculate total credit hours
  const totalCreditHours = registration.courseUploads.reduce((total, upload) => total + (upload.course.credits || 0), 0)

  // Check if registration is pending or has pending courses
  const isPending =
    registration.status === "PENDING" || registration.courseUploads.some((upload) => upload.status === "PENDING")

  // Direct print function without using react-to-print
  const handlePrint = () => {
    setIsGenerating(true)

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank")

      if (!printWindow) {
        toast({
          title: "Error",
          description: "Could not open print window. Please check your popup blocker settings.",
          variant: "destructive",
        })
        setIsGenerating(false)
        return
      }

      // Get the HTML content to print
      const contentToPrint = printRef.current

      if (!contentToPrint) {
        toast({
          title: "Error",
          description: "Could not find content to print.",
          variant: "destructive",
        })
        printWindow.close()
        setIsGenerating(false)
        return
      }

      // Clone the content
      const clonedContent = contentToPrint.cloneNode(true) as HTMLElement

      // Create the print document
      printWindow.document.open()
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Registration Card - ${registration.user.profile?.studentId || registration.user.id}</title>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              box-sizing: border-box;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-logo {
              max-height: 60px;
              width: auto;
            }
            .print-title {
              font-size: 18px;
              font-weight: bold;
              margin: 8px 0;
            }
            .print-subtitle {
              font-size: 14px;
              margin: 4px 0;
            }
            .print-info-grid {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .print-info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .print-info-item {
              margin-bottom: 8px;
            }
            .print-info-label {
              font-size: 10px;
              color: #666;
              margin-bottom: 2px;
            }
            .print-info-value {
              font-weight: 500;
              font-size: 11px;
            }
            .print-photo-container {
              border: 1px solid #ddd;
              padding: 4px;
              background-color: #f9f9f9;
              text-align: center;
              height: fit-content;
            }
            .print-photo {
              width: 100px;
              height: 120px;
              object-fit: cover;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 10px;
            }
            .print-table th,
            .print-table td {
              border: 1px solid #ddd;
              padding: 4px;
              text-align: left;
            }
            .print-table th {
              background-color: #f2f2f2;
              font-weight: bold;
              font-size: 10px;
            }
            .print-section-title {
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0 8px 0;
              border-bottom: 1px solid #ddd;
              padding-bottom: 3px;
            }
            .print-signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-top: 30px;
            }
            .print-signature-line {
              border-top: 1px dashed #000;
              padding-top: 4px;
              text-align: center;
              font-size: 10px;
            }
            .print-footer {
              margin-top: 20px;
              font-size: 9px;
              color: #666;
            }
            .print-status-badge {
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 9px;
              font-weight: 500;
            }
            .print-status-approved {
              background-color: #d1fae5;
              color: #065f46;
            }
            .print-status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .print-status-rejected {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .print-total-row {
              background-color: #f9f9f9;
              font-weight: bold;
            }
            .print-warning {
              color: #92400e;
              font-weight: bold;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${clonedContent.innerHTML}
          </div>
          <script>
            // Auto print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 500);
            };
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()

      // Success message after a delay
      setTimeout(() => {
        setIsGenerating(false)
        toast({
          title: "Success",
          description: "Registration card printed successfully",
        })
      }, 1500)
    } catch (error) {
      console.error("Print error:", error)
      setIsGenerating(false)
      toast({
        title: "Error",
        description: "Failed to print registration card. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold">Registration Card</h2>
        <div>
          <Button onClick={handlePrint} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print Card
              </>
            )}
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
