"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, DownloadIcon, FileTextIcon, Loader2Icon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ReportsClient() {
  const [reportType, setReportType] = useState("weekly")
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const generateReport = async () => {
    setIsLoading(true)

    try {
      let url = `/api/reports?type=${reportType}`

      if (dateRange.from && dateRange.to) {
        url += `&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const data = await response.json()
      setReportData(data)

      toast({
        title: "Report generated",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully.`,
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = () => {
    if (!reportData) return

    try {
      // Create a CSV string
      let csv = "Report Type,Date Range\n"
      csv += `${reportData.reportType},${format(new Date(reportData.dateRange.start), "PPP")} to ${format(new Date(reportData.dateRange.end), "PPP")}\n\n`

      // Add summary data
      csv += "Summary Statistics\n"
      csv += "Metric,Value\n"
      csv += `New Students,${reportData.summary.totalNewStudents}\n`
      csv += `New Staff,${reportData.summary.totalNewStaff}\n`
      csv += `Total Registrations,${reportData.summary.totalRegistrations}\n`
      csv += `Approved Registrations,${reportData.summary.approvedRegistrations}\n`
      csv += `Pending Registrations,${reportData.summary.pendingRegistrations}\n`
      csv += `Rejected Registrations,${reportData.summary.rejectedRegistrations}\n`
      csv += `Attendance Rate,${reportData.summary.attendanceRate}%\n\n`

      // Add registrations data
      if (reportData.data.registrations.length > 0) {
        csv += "Course Registrations\n"
        csv += "Student,Email,Course,Course Code,Semester,Status,Date\n"

        reportData.data.registrations.forEach((reg: any) => {
          csv += `"${reg.student.name}","${reg.student.email}","${reg.course.title}","${reg.course.code}","${reg.semester.name}","${reg.status}","${format(new Date(reg.createdAt), "PPP")}"\n`
        })

        csv += "\n"
      }

      // Add new students data
      if (reportData.data.newStudents.length > 0) {
        csv += "New Students\n"
        csv += "Name,Email,Registration Date\n"

        reportData.data.newStudents.forEach((student: any) => {
          csv += `"${student.name}","${student.email}","${format(new Date(student.createdAt), "PPP")}"\n`
        })

        csv += "\n"
      }

      // Add new staff data
      if (reportData.data.newStaff.length > 0) {
        csv += "New Staff\n"
        csv += "Name,Email,Registration Date\n"

        reportData.data.newStaff.forEach((staff: any) => {
          csv += `"${staff.name}","${staff.email}","${format(new Date(staff.createdAt), "PPP")}"\n`
        })
      }

      // Create a blob and download
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.setAttribute("hidden", "")
      a.setAttribute("href", url)
      a.setAttribute("download", `${reportData.reportType}_report_${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Report downloaded",
        description: "The report has been downloaded as a CSV file.",
      })
    } catch (error) {
      console.error("Error downloading report:", error)
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs defaultValue="weekly" onValueChange={setReportType}>
      <div className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Generate {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</CardTitle>
            <CardDescription>Generate a report for the selected time period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Custom Date Range (Optional)</span>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="date" variant={"outline"} className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                If no date range is selected, the report will use the default {reportType} range.
              </p>
            </div>

            <Button onClick={generateReport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</CardTitle>
              <CardDescription>
                {format(new Date(reportData.dateRange.start), "PPP")} to{" "}
                {format(new Date(reportData.dateRange.end), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">Summary</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">New Students</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{reportData.summary.totalNewStudents}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">New Staff</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{reportData.summary.totalNewStaff}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Course Registrations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{reportData.summary.totalRegistrations}</p>
                      <p className="text-xs text-muted-foreground">
                        {reportData.summary.approvedRegistrations} approved, {reportData.summary.pendingRegistrations}{" "}
                        pending
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{reportData.summary.attendanceRate}%</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {reportData.data.registrations.length > 0 && (
                <div>
                  <h3 className="mb-2 text-lg font-medium">Recent Course Registrations</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.data.registrations.slice(0, 5).map((reg: any) => (
                        <TableRow key={reg.id}>
                          <TableCell>{reg.student.name}</TableCell>
                          <TableCell>{reg.course.title}</TableCell>
                          <TableCell>{reg.status}</TableCell>
                          <TableCell>{format(new Date(reg.createdAt), "PPP")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {reportData.data.newStudents.length > 0 && (
                <div>
                  <h3 className="mb-2 text-lg font-medium">New Students</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registration Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.data.newStudents.slice(0, 5).map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{format(new Date(student.createdAt), "PPP")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={downloadReport}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Tabs>
  )
}
