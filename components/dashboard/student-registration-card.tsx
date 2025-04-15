"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

export function StudentRegistrationCard({
  userId,
  registrationCard,
  courses,
}: {
  userId: string
  registrationCard: any
  courses: any[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 500)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Simulate API call to generate PDF
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Registration card downloaded",
        description: "Your registration card has been downloaded successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your registration card",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const approvedCourses = courses.filter((course) => course.status === "APPROVED")
  const totalCredits = approvedCourses.reduce((sum, course) => sum + course.course.credits, 0)

  if (!registrationCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registration Card Not Available</CardTitle>
          <CardDescription>Your registration card is not available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800">Registration Not Approved</h3>
            <p className="text-yellow-700 mt-2">
              Your course registration has not been fully approved yet. Once all your courses are approved, your
              registration card will be available here.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/my-courses")}>
              View My Courses
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registration Status</CardTitle>
          <CardDescription>Your registration status for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Registration Status</p>
                <p className="text-sm text-green-600 font-medium">Approved</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Card Number</p>
                <p className="text-sm">{registrationCard.cardNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Issue Date</p>
                <p className="text-sm">{formatDate(new Date(registrationCard.issuedDate))}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Credits</p>
                <p className="text-sm">{totalCredits} Credit Hours</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handlePrint} disabled={isPrinting}>
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? "Printing..." : "Print Registration Card"}
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download as PDF"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="print:shadow-none" id="registration-card-print">
        <CardContent className="p-6">
          <div className="border-2 border-gray-200 p-6 rounded-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">BUGEMA UNIVERSITY</h2>
              <p className="text-sm">Excellence in Service</p>
              <p className="text-sm">A Chartered Seventh-Day Adventist Institution of Higher Learning</p>
              <h3 className="text-lg font-bold mt-4">OFFICIAL REGISTRATION CARD</h3>
              <p className="text-sm">{registrationCard.semester.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm font-medium">Student Name:</p>
                <p className="text-sm">{registrationCard.user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Student ID:</p>
                <p className="text-sm">{registrationCard.user.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Registration Number:</p>
                <p className="text-sm">{registrationCard.cardNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Issue Date:</p>
                <p className="text-sm">{formatDate(new Date(registrationCard.issuedDate))}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-bold mb-2">Registered Courses</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Course Code
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Course Title
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Credits
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{course.course.code}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{course.course.title}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{course.course.credits}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium" colSpan={2}>
                        Total Credit Hours
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{totalCredits}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="border-t pt-4">
                <p className="text-center text-sm">Registrar Signature</p>
                <p className="text-center text-xs">University Registrar</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-center text-sm">Student Signature</p>
                <p className="text-center text-xs">Date</p>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
              <p>This card must be presented when requested by university officials.</p>
              <p>Not valid without official university seal.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
