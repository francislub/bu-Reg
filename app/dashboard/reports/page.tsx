"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Calendar, Download, LineChart, Loader2, PieChart, Users } from "lucide-react"
import { useReactToPrint } from "react-to-print"

export default function ReportsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("enrollment")
  const [timeframe, setTimeframe] = useState("weekly")
  const [enrollmentData, setEnrollmentData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [isPrinting, setIsPrinting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session || session.user.role !== "REGISTRAR") {
      router.push("/dashboard/reports")
    }

    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        // Fetch enrollment data
        const enrollmentResponse = await fetch("/api/analytics/enrollment")
        const enrollmentResult = await enrollmentResponse.json()
        if (enrollmentResult.success) {
          setEnrollmentData(enrollmentResult.semesters)
        }

        // Fetch department data
        const departmentResponse = await fetch("/api/analytics/departments")
        const departmentResult = await departmentResponse.json()
        if (departmentResult.success) {
          setDepartmentData(departmentResult.departments)
        }

        // Fetch performance data
        const performanceResponse = await fetch("/api/analytics/performance")
        const performanceResult = await performanceResponse.json()
        if (performanceResult.success) {
          setPerformanceData(performanceResult.departments)
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch report data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchReportData()
    }
  }, [session, router, toast])

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true)
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })
    },
    onAfterPrint: () => {
      setIsPrinting(false)
    },
  })

  const getReportTitle = () => {
    const reportTypeText =
      reportType === "enrollment"
        ? "Enrollment"
        : reportType === "department"
          ? "Department Distribution"
          : "Academic Performance"

    const timeframeText = timeframe === "weekly" ? "Weekly" : timeframe === "monthly" ? "Monthly" : "Yearly"

    return `${timeframeText} ${reportTypeText} Report`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCurrentDateRange = () => {
    const today = new Date()
    const startDate = new Date()

    if (timeframe === "weekly") {
      startDate.setDate(today.getDate() - 7)
    } else if (timeframe === "monthly") {
      startDate.setMonth(today.getMonth() - 1)
    } else {
      startDate.setFullYear(today.getFullYear() - 1)
    }

    return `${formatDate(startDate)} - ${formatDate(today)}`
  }

  if (!session || session.user.role !== "REGISTRAR") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="Generate and print university reports.">
        <Button onClick={handlePrint} disabled={isPrinting}>
          {isPrinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Printing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Print Report
            </>
          )}
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enrollment">Enrollment Report</SelectItem>
              <SelectItem value="department">Department Distribution</SelectItem>
              <SelectItem value="performance">Academic Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time Frame</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 p-4 bg-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{getReportTitle()}</h2>
          <p className="text-muted-foreground">Bugema University</p>
          <p className="text-sm text-muted-foreground">Report Period: {getCurrentDateRange()}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue={reportType} value={reportType} onValueChange={setReportType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
              <TabsTrigger value="department">Departments</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="enrollment" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Student Enrollment</CardTitle>
                    <CardDescription>Student enrollment trends across semesters</CardDescription>
                  </div>
                  <LineChart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {enrollmentData.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <Users className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {enrollmentData.reduce((sum, item) => sum + item.students, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Students</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <Calendar className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">{enrollmentData.length}</div>
                          <div className="text-sm text-muted-foreground">Semesters</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <LineChart className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {enrollmentData.length > 0
                              ? `${enrollmentData[enrollmentData.length - 1].growthRate}%`
                              : "0%"}
                          </div>
                          <div className="text-sm text-muted-foreground">Growth Rate</div>
                        </div>
                      </div>

                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Semester</th>
                            <th className="text-right py-2">Students</th>
                            <th className="text-right py-2">New Students</th>
                            <th className="text-right py-2">Growth Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollmentData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{item.semester}</td>
                              <td className="text-right py-2">{item.students}</td>
                              <td className="text-right py-2">{item.newStudents}</td>
                              <td className="text-right py-2">{item.growthRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No enrollment data available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="department" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Department Distribution</CardTitle>
                    <CardDescription>Student distribution across departments</CardDescription>
                  </div>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {departmentData.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <Users className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {departmentData.reduce((sum, item) => sum + item.students, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Students</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <Calendar className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">{departmentData.length}</div>
                          <div className="text-sm text-muted-foreground">Departments</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <PieChart className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {departmentData.length > 0 ? Math.max(...departmentData.map((d) => d.students)) : 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Largest Department</div>
                        </div>
                      </div>

                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Department</th>
                            <th className="text-right py-2">Students</th>
                            <th className="text-right py-2">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {departmentData.map((item, index) => {
                            const totalStudents = departmentData.reduce((sum, item) => sum + item.students, 0)
                            const percentage = totalStudents > 0 ? Math.round((item.students / totalStudents) * 100) : 0

                            return (
                              <tr key={index} className="border-b">
                                <td className="py-2">{item.name}</td>
                                <td className="text-right py-2">{item.students}</td>
                                <td className="text-right py-2">{percentage}%</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No department data available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Academic Performance</CardTitle>
                    <CardDescription>Performance metrics across departments</CardDescription>
                  </div>
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {performanceData.length > 0 ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <BarChart className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {performanceData.length > 0
                              ? (
                                  performanceData.reduce((sum, item) => sum + item.gpa, 0) / performanceData.length
                                ).toFixed(1)
                              : "0.0"}
                          </div>
                          <div className="text-sm text-muted-foreground">Average GPA</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <Users className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {performanceData.length > 0
                              ? (
                                  performanceData.reduce((sum, item) => sum + item.attendance, 0) /
                                  performanceData.length
                                ).toFixed(0)
                              : "0"}
                            %
                          </div>
                          <div className="text-sm text-muted-foreground">Attendance Rate</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <LineChart className="h-8 w-8 text-primary mb-2" />
                          <div className="text-2xl font-bold">
                            {performanceData.length > 0
                              ? (
                                  performanceData.reduce((sum, item) => sum + item.passRate, 0) / performanceData.length
                                ).toFixed(0)
                              : "0"}
                            %
                          </div>
                          <div className="text-sm text-muted-foreground">Pass Rate</div>
                        </div>
                      </div>

                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Department</th>
                            <th className="text-right py-2">GPA</th>
                            <th className="text-right py-2">Attendance</th>
                            <th className="text-right py-2">Pass Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceData.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{item.department}</td>
                              <td className="text-right py-2">{item.gpa.toFixed(1)}</td>
                              <td className="text-right py-2">{item.attendance}%</td>
                              <td className="text-right py-2">{item.passRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No performance data available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardShell>
  )
}
