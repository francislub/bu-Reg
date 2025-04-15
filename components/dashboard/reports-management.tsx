"use client"

import { useState } from "react"
import { BarChart, Download, FileText, PieChart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { DashboardBarChart } from "@/components/dashboard/charts/bar-chart"
import { DashboardPieChart } from "@/components/dashboard/charts/pie-chart"
import { DashboardLineChart } from "@/components/dashboard/charts/line-chart"

export function ReportsManagement() {
  const { toast } = useToast()
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data for reports
  const enrollmentByDepartment = [
    { department: "Computer Science", count: 245 },
    { department: "Business Administration", count: 187 },
    { department: "Engineering", count: 156 },
    { department: "Mathematics", count: 89 },
    { department: "Physics", count: 67 },
  ]

  const registrationStatusData = [
    { name: "Approved", value: 567, color: "#4ade80" },
    { name: "Pending", value: 124, color: "#facc15" },
    { name: "Rejected", value: 43, color: "#f87171" },
  ]

  const enrollmentTrends = [
    { month: "Jan", students: 980 },
    { month: "Feb", students: 1020 },
    { month: "Mar", students: 1050 },
    { month: "Apr", students: 1080 },
    { month: "May", students: 1120 },
    { month: "Jun", students: 1150 },
  ]

  const handleGenerateReport = (reportType: string) => {
    setIsGenerating(true)
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: `The ${reportType} report has been generated successfully.`,
        variant: "default",
      })
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            <SelectItem value="fall2025">Fall 2025</SelectItem>
            <SelectItem value="spring2026">Spring 2026</SelectItem>
            <SelectItem value="summer2026">Summer 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="enrollment">Enrollment Reports</TabsTrigger>
          <TabsTrigger value="registration">Registration Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment by Department</CardTitle>
                <CardDescription>Student distribution across departments</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardBarChart
                  data={enrollmentByDepartment}
                  xAxisKey="department"
                  bars={[
                    {
                      dataKey: "count",
                      name: "Students",
                      color: "#3b82f6",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>Monthly enrollment trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardLineChart
                  data={enrollmentTrends}
                  xAxisKey="month"
                  lines={[
                    {
                      dataKey: "students",
                      name: "Students",
                      color: "#10b981",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enrollment Reports</CardTitle>
                <CardDescription>Generate and download enrollment reports</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <ReportCard
                  title="Department Enrollment"
                  description="Detailed enrollment statistics by department"
                  icon={BarChart}
                  onGenerate={() => handleGenerateReport("Department Enrollment")}
                  isGenerating={isGenerating}
                />
                <ReportCard
                  title="Student Demographics"
                  description="Student demographics and distribution"
                  icon={PieChart}
                  onGenerate={() => handleGenerateReport("Student Demographics")}
                  isGenerating={isGenerating}
                />
                <ReportCard
                  title="Enrollment Trends"
                  description="Monthly and yearly enrollment trends"
                  icon={Users}
                  onGenerate={() => handleGenerateReport("Enrollment Trends")}
                  isGenerating={isGenerating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
                <CardDescription>Overview of registration statuses</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardPieChart data={registrationStatusData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Timeline</CardTitle>
                <CardDescription>Registration activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardLineChart
                  data={[
                    { day: "Mon", registrations: 45 },
                    { day: "Tue", registrations: 52 },
                    { day: "Wed", registrations: 68 },
                    { day: "Thu", registrations: 74 },
                    { day: "Fri", registrations: 92 },
                    { day: "Sat", registrations: 58 },
                    { day: "Sun", registrations: 38 },
                  ]}
                  xAxisKey="day"
                  lines={[
                    {
                      dataKey: "registrations",
                      name: "Registrations",
                      color: "#8b5cf6",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registration Reports</CardTitle>
                <CardDescription>Generate and download registration reports</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <ReportCard
                  title="Registration Summary"
                  description="Summary of all course registrations"
                  icon={FileText}
                  onGenerate={() => handleGenerateReport("Registration Summary")}
                  isGenerating={isGenerating}
                />
                <ReportCard
                  title="Approval Statistics"
                  description="Statistics on registration approvals"
                  icon={BarChart}
                  onGenerate={() => handleGenerateReport("Approval Statistics")}
                  isGenerating={isGenerating}
                />
                <ReportCard
                  title="Course Popularity"
                  description="Most popular courses by registration"
                  icon={PieChart}
                  onGenerate={() => handleGenerateReport("Course Popularity")}
                  isGenerating={isGenerating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>System usage and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardLineChart
                  data={[
                    { hour: "00:00", users: 12 },
                    { hour: "04:00", users: 5 },
                    { hour: "08:00", users: 45 },
                    { hour: "12:00", users: 78 },
                    { hour: "16:00", users: 92 },
                    { hour: "20:00", users: 48 },
                  ]}
                  xAxisKey="hour"
                  lines={[
                    {
                      dataKey: "users",
                      name: "Active Users",
                      color: "#ec4899",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average system response times</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardBarChart
                  data={[
                    { endpoint: "Login", time: 120 },
                    { endpoint: "Registration", time: 350 },
                    { endpoint: "Course List", time: 180 },
                    { endpoint: "Approvals", time: 220 },
                    { endpoint: "Dashboard", time: 150 },
                  ]}
                  xAxisKey="endpoint"
                  bars={[
                    {
                      dataKey: "time",
                      name: "Response Time (ms)",
                      color: "#f97316",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Performance Reports</CardTitle>
                <CardDescription>Generate and download system performance reports</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <ReportCard
                  title="System Usage"
                  description="Detailed system usage statistics"
                  icon={BarChart}
                  onGenerate={() => handleGenerateReport("System Usage")}
                  isGenerating={isGenerating}
                />
                <ReportCard
                  title="Error Logs"
                  description="System error and exception logs"
                  icon={FileText}
                  onGenerate={() => handleGenerateReport("Error Logs")}
                  isGenerating={isGenerating}
                />
                <ReportCard
                  title="Performance Metrics"
                  description="Comprehensive performance metrics"
                  icon={PieChart}
                  onGenerate={() => handleGenerateReport("Performance Metrics")}
                  isGenerating={isGenerating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportCard({
  title,
  description,
  icon: Icon,
  onGenerate,
  isGenerating,
}: {
  title: string
  description: string
  icon: any
  onGenerate: () => void
  isGenerating: boolean
}) {
  return (
    <div className="flex flex-col p-4 border rounded-lg">
      <div className="flex items-center mb-2">
        <Icon className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      <Button variant="outline" size="sm" className="mt-auto" onClick={onGenerate} disabled={isGenerating}>
        <Download className="h-4 w-4 mr-2" />
        {isGenerating ? "Generating..." : "Generate"}
      </Button>
    </div>
  )
}
