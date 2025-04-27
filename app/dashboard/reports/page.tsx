"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Loader2, BarChart, LineChart } from "lucide-react"
import {
  generateRegistrationSummaryReport,
  generateStudentEnrollmentReport,
  generateCoursePopularityReport,
} from "@/lib/actions/report-actions"
import { RegistrationSummaryReport } from "@/components/dashboard/reports/registration-summary-report"
import { CoursePopularityReport } from "@/components/dashboard/reports/course-popularity-report"
import { StudentEnrollmentReport } from "@/components/dashboard/reports/student-enrollment-report"

export default function ReportsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [semesters, setSemesters] = useState<any[]>([])
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("")
  const [reportType, setReportType] = useState<string>("registration")
  const [reportData, setReportData] = useState<any>(null)

  // Check if user is authorized (only REGISTRAR, ADMIN, or STAFF)
  useEffect(() => {
    if (
      session &&
      session.user.role !== "REGISTRAR" &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "STAFF"
    ) {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch semesters and academic years
        const semestersResponse = await fetch("/api/semesters")
        const academicYearsResponse = await fetch("/api/academic-years")

        if (semestersResponse.ok && academicYearsResponse.ok) {
          const semestersData = await semestersResponse.json()
          const academicYearsData = await academicYearsResponse.json()

          setSemesters(semestersData.semesters || [])
          setAcademicYears(academicYearsData.academicYears || [])

          // Set default selections
          if (semestersData.semesters?.length > 0) {
            const activeSemester = semestersData.semesters.find((s: any) => s.isActive)
            setSelectedSemester(activeSemester?.id || semestersData.semesters[0].id)
          }

          if (academicYearsData.academicYears?.length > 0) {
            const currentYear = academicYearsData.academicYears.find((y: any) => y.isCurrent)
            setSelectedAcademicYear(currentYear?.id || academicYearsData.academicYears[0].id)
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "REGISTRAR" || session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") {
      fetchData()
    }
  }, [session, toast])

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    setReportData(null)

    try {
      let result

      switch (reportType) {
        case "registration":
          if (!selectedSemester) {
            toast({
              title: "Error",
              description: "Please select a semester",
              variant: "destructive",
            })
            return
          }
          result = await generateRegistrationSummaryReport(selectedSemester)
          break

        case "enrollment":
          result = await generateStudentEnrollmentReport(selectedAcademicYear || undefined)
          break

        case "course-popularity":
          if (!selectedSemester) {
            toast({
              title: "Error",
              description: "Please select a semester",
              variant: "destructive",
            })
            return
          }
          result = await generateCoursePopularityReport(selectedSemester)
          break

        default:
          toast({
            title: "Error",
            description: "Invalid report type",
            variant: "destructive",
          })
          return
      }

      if (result.success) {
        setReportData(result.report)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate report",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleExportReport = () => {
    if (!reportData) return

    try {
      // Create a blob with the report data
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create a link and trigger download
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Report exported successfully",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      })
    }
  }

  if (session && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="Generate and view system reports">
        {reportData && (
          <Button variant="outline" onClick={handleExportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        )}
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Select the type of report you want to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="registration" value={reportType} onValueChange={setReportType} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="registration" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Registration Summary
                  </TabsTrigger>
                  <TabsTrigger value="enrollment" className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    Student Enrollment
                  </TabsTrigger>
                  <TabsTrigger value="course-popularity" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Course Popularity
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  <TabsContent value="registration">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="semester">Select Semester</Label>
                          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger id="semester">
                              <SelectValue placeholder="Select a semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {semesters.map((semester) => (
                                <SelectItem key={semester.id} value={semester.id}>
                                  {semester.name} {semester.isActive && "(Active)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="enrollment">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="academicYear">Select Academic Year (Optional)</Label>
                          <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                            <SelectTrigger id="academicYear">
                              <SelectValue placeholder="All Academic Years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Academic Years</SelectItem>
                              {academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.name} {year.isCurrent && "(Current)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="course-popularity">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="semester">Select Semester</Label>
                          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger id="semester">
                              <SelectValue placeholder="Select a semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {semesters.map((semester) => (
                                <SelectItem key={semester.id} value={semester.id}>
                                  {semester.name} {semester.isActive && "(Active)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full">
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Report"
                    )}
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {reportData && (
            <Card>
              <CardHeader>
                <CardTitle>Report Results</CardTitle>
                <CardDescription>Generated on {new Date(reportData.generatedAt).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportType === "registration" && <RegistrationSummaryReport data={reportData} />}
                {reportType === "enrollment" && <StudentEnrollmentReport data={reportData} />}
                {reportType === "course-popularity" && <CoursePopularityReport data={reportData} />}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
