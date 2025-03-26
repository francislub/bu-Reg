"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, PieChart, LineChart, Download, FileText, Users, BookOpen, Printer, Loader2 } from "lucide-react"
import { useReactToPrint } from "react-to-print"

export default function ReportsPage() {
  const { toast } = useToast()
  const [selectedSemester, setSelectedSemester] = useState("fall2023")
  const [selectedYear, setSelectedYear] = useState("2023-2024")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState({
    enrollmentStats: {
      totalEnrollments: 0,
      averagePerCourse: 0,
      fullCourses: 0,
      lowEnrollment: 0,
    },
    enrollmentTrends: [],
    programDistribution: [],
    departmentEnrollment: [],
    coursePopularity: [],
    facultyLoad: [],
  })

  const printRef = useRef(null)

  useEffect(() => {
    fetchReportData()
  }, [selectedSemester, selectedYear])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // Fetch enrollment statistics
      const statsRes = await fetch(
        `/api/reports/enrollment-stats?semester=${selectedSemester}&academicYear=${selectedYear}`,
      )
      const statsData = await statsRes.json()

      // Fetch enrollment trends
      const trendsRes = await fetch(`/api/reports/enrollment-trends?academicYear=${selectedYear}`)
      const trendsData = await trendsRes.json()

      // Fetch program distribution
      const programRes = await fetch(
        `/api/reports/program-distribution?semester=${selectedSemester}&academicYear=${selectedYear}`,
      )
      const programData = await programRes.json()

      // Fetch department enrollment
      const deptRes = await fetch(
        `/api/reports/department-enrollment?semester=${selectedSemester}&academicYear=${selectedYear}`,
      )
      const deptData = await deptRes.json()

      // Fetch course popularity
      const courseRes = await fetch(
        `/api/reports/course-popularity?semester=${selectedSemester}&academicYear=${selectedYear}`,
      )
      const courseData = await courseRes.json()

      // Fetch faculty teaching load
      const facultyRes = await fetch(
        `/api/reports/faculty-load?semester=${selectedSemester}&academicYear=${selectedYear}`,
      )
      const facultyData = await facultyRes.json()

      setReportData({
        enrollmentStats: statsData,
        enrollmentTrends: trendsData,
        programDistribution: programData,
        departmentEnrollment: deptData,
        coursePopularity: courseData,
        facultyLoad: facultyData,
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${selectedSemester}-${selectedYear}-report`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        toast({
          title: "Preparing document",
          description: "Please wait while we prepare the document for printing.",
        })
        resolve()
      })
    },
    onAfterPrint: () => {
      toast({
        title: "Print successful",
        description: "The report has been sent to your printer.",
      })
    },
  })

  const generateReport = async (type) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `${type} Report - ${selectedSemester} ${selectedYear}`,
          description: `Generated report for ${type} data in ${selectedSemester} ${selectedYear}`,
          data: reportData[type],
          type,
          createdBy: "admin", // This would be the actual user ID in a real app
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to generate report")
      }

      toast({
        title: "Report generated",
        description: "The report has been saved to the database.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fall2023">Fall 2023</SelectItem>
              <SelectItem value="spring2024">Spring 2024</SelectItem>
              <SelectItem value="summer2024">Summer 2024</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-2024">2023-2024</SelectItem>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      <div ref={printRef}>
        <Tabs defaultValue="enrollment">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading enrollment data...</span>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {reportData.enrollmentStats.totalEnrollments.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For {selectedSemester} {selectedYear}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Per Course</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.enrollmentStats.averagePerCourse}</div>
                      <p className="text-xs text-muted-foreground">Students per course</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Full Courses</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.enrollmentStats.fullCourses}</div>
                      <p className="text-xs text-muted-foreground">At maximum capacity</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Low Enrollment</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.enrollmentStats.lowEnrollment}</div>
                      <p className="text-xs text-muted-foreground">Less than 50% capacity</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Enrollment Trends</CardTitle>
                      <CardDescription>Monthly enrollment trends for the current academic year</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        {reportData.enrollmentTrends.length > 0 ? (
                          <div className="w-full h-full">
                            {/* Chart would be rendered here with a charting library */}
                            <LineChart className="h-8 w-8 text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Enrollment trend chart</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No enrollment trend data available</div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => generateReport("enrollmentTrends")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Enrollment by Program</CardTitle>
                      <CardDescription>Distribution of students across different programs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                        {reportData.programDistribution.length > 0 ? (
                          <div className="w-full h-full">
                            {/* Chart would be rendered here with a charting library */}
                            <PieChart className="h-8 w-8 text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Program distribution chart</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No program distribution data available</div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => generateReport("programDistribution")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="departments" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading department data...</span>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Department Enrollment</CardTitle>
                  <CardDescription>Number of students enrolled in courses by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                    {reportData.departmentEnrollment.length > 0 ? (
                      <div className="w-full h-full">
                        {/* Chart would be rendered here with a charting library */}
                        <BarChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Department enrollment chart</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No department enrollment data available</div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => generateReport("departmentEnrollment")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="courses" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading course data...</span>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Course Popularity</CardTitle>
                  <CardDescription>Most popular courses by enrollment numbers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                    {reportData.coursePopularity.length > 0 ? (
                      <div className="w-full h-full">
                        {/* Chart would be rendered here with a charting library */}
                        <BarChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Course popularity chart</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No course popularity data available</div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => generateReport("coursePopularity")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="faculty" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading faculty data...</span>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Teaching Load</CardTitle>
                  <CardDescription>Number of courses and students per faculty member</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                    {reportData.facultyLoad.length > 0 ? (
                      <div className="w-full h-full">
                        {/* Chart would be rendered here with a charting library */}
                        <BarChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Faculty teaching load chart</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No faculty teaching load data available</div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => generateReport("facultyLoad")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

