"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"
import Image from "next/image"

interface RegistrationCardProps {
  registrationCard: {
    cardNumber: string
    createdAt: string | Date
    user: {
      name: string
      email: string
      profile: {
        firstName: string
        lastName: string
        middleName?: string
        gender?: string
        dateOfBirth?: string | Date
      }
    }
    semester: {
      name: string
      startDate: string | Date
      endDate: string | Date
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
                    <p className="text-sm">Excellence in Service</p>
                    <p className="text-xs">A Chartered Seventh-Day Adventist Institution of Higher Learning</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">Registration Card</p>
                  <p className="text-sm">Card #: {registrationCard.cardNumber}</p>
                  <p className="text-sm">Issue Date: {new Date(registrationCard.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t-2 border-b-2 border-gray-800 py-4 mb-6">
                <h2 className="text-xl font-bold text-center">{registrationCard.semester.name} Registration</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-bold">Student Information</p>
                  <p className="text-sm">
                    Name: {registrationCard.user.profile.firstName} {registrationCard.user.profile.middleName || ""}{" "}
                    {registrationCard.user.profile.lastName}
                  </p>
                  <p className="text-sm">Email: {registrationCard.user.email}</p>
                  {registrationCard.user.profile.gender && (
                    <p className="text-sm">Gender: {registrationCard.user.profile.gender}</p>
                  )}
                  {registrationCard.user.profile.dateOfBirth && (
                    <p className="text-sm">
                      Date of Birth: {new Date(registrationCard.user.profile.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">Semester Information</p>
                  <p className="text-sm">Semester: {registrationCard.semester.name}</p>
                  <p className="text-sm">
                    Start Date: {new Date(registrationCard.semester.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    End Date: {new Date(registrationCard.semester.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-bold mb-2">Registered Courses</p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left text-sm">Course Code</th>
                      <th className="border border-gray-300 p-2 text-left text-sm">Course Title</th>
                      <th className="border border-gray-300 p-2 text-left text-sm">Department</th>
                      <th className="border border-gray-300 p-2 text-center text-sm">Credits</th>
                      <th className="border border-gray-300 p-2 text-center text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td className="border border-gray-300 p-2 text-sm">{course.course.code}</td>
                        <td className="border border-gray-300 p-2 text-sm">{course.course.title}</td>
                        <td className="border border-gray-300 p-2 text-sm">{course.course.department.name}</td>
                        <td className="border border-gray-300 p-2 text-center text-sm">{course.course.credits}</td>
                        <td className="border border-gray-300 p-2 text-center text-sm">{course.status}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={3} className="border border-gray-300 p-2 text-right text-sm">
                        Total Credits:
                      </td>
                      <td className="border border-gray-300 p-2 text-center text-sm">{totalCredits}</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-t border-gray-800 pt-4 mt-8">
                  <p className="text-center text-sm">Student Signature</p>
                </div>
                <div className="border-t border-gray-800 pt-4 mt-8">
                  <p className="text-center text-sm">Registrar Signature</p>
                </div>
              </div>

              <div className="text-center text-xs mt-8">
                <p>This registration card is an official document of Bugema University.</p>
                <p>Please keep it safe and present it when required.</p>
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
