"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"
import Image from "next/image"
import { formatDate } from "@/lib/utils"

interface RegistrationCardProps {
  registrationCard: {
    cardNumber: string
    issuedDate: string | Date
    user: {
      name: string
      email: string
      profile: {
        firstName: string
        lastName: string
        middleName?: string
        gender?: string
        dateOfBirth?: string | Date
        studentId?: string
        program?: string
      }
    }
    semester: {
      name: string
      startDate: string | Date
      endDate: string | Date
      academicYear: {
        name: string
      }
    }
  }
  courses: Array<{
    id: string
    course: {
      code: string
      title: string
      credits: number
      department: {
        name: string
      }
    }
    status: string
  }>
}

export function PrintRegistrationCard({ registrationCard, courses }: RegistrationCardProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Registration_Card_${registrationCard.cardNumber}`,
    onBeforeGetContent: () => {
      setIsPrinting(true)
      return Promise.resolve()
    },
    onAfterPrint: () => {
      setIsPrinting(false)
    },
  })

  const totalCredits = courses.reduce((sum, course) => sum + course.course.credits, 0)
  const approvedCourses = courses.filter((course) => course.status === "APPROVED")

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Registration Card
        </Button>
        <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div ref={printRef} className="print-container">
            <div className="border-2 border-gray-800 p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src="/logo.png"
                      alt="Bugema University Logo"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">BUGEMA UNIVERSITY</h1>
                    <p className="text-sm">P.O. Box 6529 Kampala - Uganda, Tel: +256-312-351-400</p>
                    <p className="text-xs">MAIN CAMPUS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">Registration Card</p>
                  <p className="text-sm">Printed: {formatDate(new Date())}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 border border-gray-300">
                <div className="p-3 border-r border-gray-300">
                  <h3 className="text-sm font-bold mb-2">Student Details</h3>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 text-sm">
                    <p className="font-semibold">Student ID:</p>
                    <p>{registrationCard.user.profile?.studentId || "N/A"}</p>
                    <p className="font-semibold">Student Name:</p>
                    <p>
                      {registrationCard.user.profile?.firstName} {registrationCard.user.profile?.lastName}
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold mb-2">Academic Period</h3>
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 text-sm">
                    <p className="font-semibold">Semester:</p>
                    <p>{registrationCard.semester.name}</p>
                    <p className="font-semibold">Year:</p>
                    <p>{registrationCard.semester.academicYear.name}</p>
                    <p className="font-semibold">Reg. Status:</p>
                    <p>Day Scholar</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="border border-gray-300 p-3">
                  <p className="font-bold uppercase">AWARD(S): {registrationCard.user.profile?.program || "N/A"}</p>
                  <p className="text-sm">
                    <span className="font-semibold">Major 1:</span>{" "}
                    {registrationCard.user.profile?.program?.split(" ").slice(3).join(" ") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 text-left text-sm">Subject ID</th>
                      <th className="border border-gray-300 p-2 text-left text-sm">Subject Name</th>
                      <th className="border border-gray-300 p-2 text-center text-sm">Credits Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="border border-gray-300 p-2 text-sm">{course.course.code}</td>
                        <td className="border border-gray-300 p-2 text-sm">{course.course.title}</td>
                        <td className="border border-gray-300 p-2 text-center text-sm">{course.course.credits}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={2} className="border border-gray-300 p-2 text-right text-sm">
                        TOTAL
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-sm">
                        {approvedCourses.reduce((sum, course) => sum + course.course.credits, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-sm mb-6">
                <p>Printed: {new Date().toLocaleString()}</p>
              </div>

              <div className="flex justify-center mt-8">
                <div className="border-2 border-gray-300 rounded-full p-8 w-40 h-40 flex items-center justify-center">
                  <p className="text-center text-sm">UNIVERSITY SEAL</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          @page {
            size: portrait;
            margin: 0.5cm;
          }
        }
      `}</style>
    </div>
  )
}
