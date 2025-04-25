"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, Printer, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function RegistrationReportsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [semesters, setSemesters] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)

        // Fetch semesters
        const semestersRes = await fetch("/api/semesters")
        const semestersData = await semestersRes.json()

        if (semestersData.success) {
          setSemesters(semestersData.semesters)

          // Set active semester as default if available
          const activeSemester = semestersData.semesters.find((s: any) => s.isActive)
          if (activeSemester) {
            setSelectedSemester(activeSemester.id)
          }
        }

        // Fetch programs
        const programsRes = await fetch("/api/programs")
        const programsData = await programsRes.json()

        if (programsData.success) {
          setPrograms(programsData.programs)
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [toast])

  useEffect(() => {
    const fetchReportData = async () => {
      if (!selectedSemester) return

      try {
        setIsLoading(true)

        let url = `/api/reports/registrations?semesterId=${selectedSemester}`

        if (selectedProgram) {
          url += `&programId=${selectedProgram}`
        }

        if (selectedStatus) {
          url += `&status=${selectedStatus}`
        }

        const res = await fetch(url)
        const data = await res.json()

        setReportData(data)
      } catch (error) {
        console.error("Error fetching report data:", error)
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedSemester) {
      fetchReportData()
    }
  }, [selectedSemester, selectedProgram, selectedStatus, toast])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (!reportData || !reportData.registrations) return

    // Create CSV content
    let csvContent = "Student ID,Student Name,Program,Status,Registration Date\n"

    reportData.registrations.forEach((reg: any) => {
      const studentId = reg.user.profile?.studentId || "N/A"
      const studentName = `${reg.user.profile?.firstName || ""} ${reg.user.profile?.lastName || ""}`.trim()
      const program = reg.user.profile?.program || "N/A"
      const status = reg.status
      const date = new Date(reg.createdAt).toLocaleDateString()

      csvContent += `"${studentId}","${studentName}","${program}","${status}","${date}"\n`
    })

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `registration_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Registration Reports" text="Generate and view student registration reports." />

      <div className="print:hidden space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Select filters to generate a registration report.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} ({semester.academicYear.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Program (Optional)</label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="All programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status (Optional)</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reportData ? (
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
                <CardDescription>
                  {reportData.semester ? (
                    <>
                      Report for {reportData.semester.name} ({reportData.semester.academicYear.name})
                    </>
                  ) : (
                    "Registration summary"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{reportData.summary.totalRegistrations}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold text-green-600">{reportData.summary.approvedRegistrations}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pendingRegistrations}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold text-red-600">{reportData.summary.rejectedRegistrations}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>List of student registrations for the selected semester.</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.registrations && reportData.registrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Courses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.registrations.map((registration: any) => (
                        <TableRow key={registration.id}>
                          <TableCell>{registration.user.profile?.studentId || "N/A"}</TableCell>
                          <TableCell>
                            {registration.user.profile?.firstName} {registration.user.profile?.lastName}
                          </TableCell>
                          <TableCell>{registration.user.profile?.program || "N/A"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                registration.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : registration.status === "REJECTED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {registration.status}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(registration.createdAt)}</TableCell>
                          <TableCell>{registration.courseUploads?.length || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No registration records found for the selected filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium">Select Filters</h3>
                <p className="text-muted-foreground mt-2">
                  Please select a semester to generate a registration report.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Print-specific view */}
      {reportData && (
        <div className="hidden print:block">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Bugema University</h1>
            <p className="text-lg">Student Registration Report</p>
            <p className="text-sm">
              {reportData.semester?.name} ({reportData.semester?.academicYear.name})
            </p>
            <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Summary</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="border p-3">
                <p className="font-medium">Total Registrations</p>
                <p className="text-xl">{reportData.summary.totalRegistrations}</p>
              </div>
              <div className="border p-3">
                <p className="font-medium">Approved</p>
                <p className="text-xl">{reportData.summary.approvedRegistrations}</p>
              </div>
              <div className="border p-3">
                <p className="font-medium">Pending</p>
                <p className="text-xl">{reportData.summary.pendingRegistrations}</p>
              </div>
              <div className="border p-3">
                <p className="font-medium">Rejected</p>
                <p className="text-xl">{reportData.summary.rejectedRegistrations}</p>
              </div>
            </div>
          </div>

          {/* Add more details for print view as needed */}
        </div>
      )}
    </DashboardShell>
  )
}
