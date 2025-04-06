"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast";
import { FileText, Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface Registration {
  id: string
  courseId: string
  status: string
  semester: string
  academicYear: string
  registeredAt: string
  course: {
    id: string
    code: string
    title: string
    credits: number
    faculty: {
      id: string
      name: string
    } | null
  }
}

export default function RegistrationHistoryPage() {
  const { data: session } = useSession()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [semesters, setSemesters] = useState<string[]>([])
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchRegistrations()
    }
  }, [session])

  useEffect(() => {
    if (registrations.length > 0) {
      // Extract unique semesters and academic years
      const uniqueSemesters = [...new Set(registrations.map((reg) => reg.semester))]
      const uniqueYears = [...new Set(registrations.map((reg) => reg.academicYear))]

      setSemesters(uniqueSemesters)
      setAcademicYears(uniqueYears)

      // Set default filters to the most recent semester and year
      if (!selectedSemester && uniqueSemesters.length > 0) {
        setSelectedSemester(uniqueSemesters[0])
      }

      if (!selectedYear && uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0])
      }

      applyFilters()
    }
  }, [registrations, selectedSemester, selectedYear])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/registrations?studentId=${session.user.id}`)
      const data = await res.json()
      setRegistrations(data.registrations)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      useToast({
        title: "Error",
        description: "Failed to fetch registration history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...registrations]

    if (selectedSemester) {
      filtered = filtered.filter((reg) => reg.semester === selectedSemester)
    }

    if (selectedYear) {
      filtered = filtered.filter((reg) => reg.academicYear === selectedYear)
    }

    setFilteredRegistrations(filtered)
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Registration_Slip_${selectedSemester}_${selectedYear}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        useToast({
          title: "Preparing document",
          description: "Please wait while we prepare your registration slip.",
        })
        resolve()
      })
    },
    onAfterPrint: () => {
      useToast({
        title: "Success",
        description: "Registration slip printed successfully.",
      })
    },
  })

  const calculateTotalCredits = () => {
    return filteredRegistrations
      .filter((reg) => reg.status === "APPROVED")
      .reduce((total, reg) => total + reg.course.credits, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Registration History</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Print Slip</span>
          </Button>
        </div>
      </div>

      <div ref={printRef}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registration Slip</CardTitle>
            <CardDescription>
              {selectedSemester && selectedYear
                ? `${selectedSemester} - ${selectedYear} Academic Year`
                : "All Registrations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Student Name</h3>
                  <p className="text-lg">{session.user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Student ID</h3>
                  <p className="text-lg">{session.user.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{session.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Credits</h3>
                  <p className="text-lg">{calculateTotalCredits()}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading registration history...</p>
              </div>
            ) : filteredRegistrations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Registered On</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.course.code}</TableCell>
                        <TableCell>{registration.course.title}</TableCell>
                        <TableCell>{registration.course.credits}</TableCell>
                        <TableCell>{registration.course.faculty?.name || "TBA"}</TableCell>
                        <TableCell>{registration.semester}</TableCell>
                        <TableCell>{new Date(registration.registeredAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              registration.status === "APPROVED"
                                ? "success"
                                : registration.status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {registration.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No registration history found.</p>
                {!selectedSemester && !selectedYear ? (
                  <p className="text-sm text-muted-foreground">You haven't registered for any courses yet.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Try selecting a different semester or academic year.</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">Total Courses: {filteredRegistrations.length}</div>
            <div className="text-sm">
              <p>Generated on: {new Date().toLocaleDateString()}</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

