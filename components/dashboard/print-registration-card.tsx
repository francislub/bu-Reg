"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"

type Registration = {
  id: string
  userId: string
  semesterId: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    profile: {
      firstName: string
      lastName: string
      studentId: string
      program: string
    }
  }
  semester: {
    id: string
    name: string
    startDate: string
    endDate: string
  }
  courseUploads: {
    id: string
    courseId: string
    status: string
    course: {
      id: string
      code: string
      name: string
      creditHours: number
      department: {
        id: string
        name: string
      }
    }
  }[]
}

export function PrintRegistrationCard({ registration }: { registration: Registration }) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Registration_Card_${registration.user.profile.studentId}`,
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
  })

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/registrations/${registration.id}/pdf`)

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Registration_Card_${registration.user.profile.studentId}.pdf`
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
        description: "Failed to download registration card",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate total credit hours
  const totalCreditHours = registration.courseUploads.reduce(
    (total, upload) => total + (upload.course.creditHours || 0),
    0,
  )

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
          <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div ref={printRef} className="bg-white p-8 rounded-lg border shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">BUGEMA UNIVERSITY</h1>
          <p className="text-lg font-semibold">STUDENT REGISTRATION CARD</p>
          <p className="text-md">{registration.semester.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>
            <p className="font-medium">
              {registration.user.profile.firstName} {registration.user.profile.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Student ID</p>
            <p className="font-medium">{registration.user.profile.studentId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="font-medium">{registration.user.profile.program}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Date</p>
            <p className="font-medium">{new Date(registration.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Registered Courses</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Course Code</th>
                <th className="border p-2 text-left">Course Name</th>
                <th className="border p-2 text-left">Department</th>
                <th className="border p-2 text-center">Credit Hours</th>
                <th className="border p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {registration.courseUploads.map((upload) => (
                <tr key={upload.id}>
                  <td className="border p-2">{upload.course.code}</td>
                  <td className="border p-2">{upload.course.name}</td>
                  <td className="border p-2">{upload.course.department?.name || "N/A"}</td>
                  <td className="border p-2 text-center">{upload.course.creditHours}</td>
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
              ))}
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
        </div>
      </div>
    </div>
  )
}
