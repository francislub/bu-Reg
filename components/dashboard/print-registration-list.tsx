"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Printer, Download, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllRegistrations } from "@/lib/actions/registration-actions"

export function PrintRegistrationList({ initialRegistrations, semesters, students, activeSemester }) {
  const router = useRouter()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState(initialRegistrations || [])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState(activeSemester?.id || "")
  const [selectedStatus, setSelectedStatus] = useState("")

  useEffect(() => {
    if (initialRegistrations) {
      setRegistrations(initialRegistrations)
    }
  }, [initialRegistrations])

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const result = await getAllRegistrations({
        semesterId: selectedSemester || undefined,
        status: selectedStatus || undefined,
        limit: 100,
      })

      if (result.success) {
        let filtered = result.registrations

        // Apply client-side search if there's a search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filtered = filtered.filter(
            (reg) =>
              reg.user.name?.toLowerCase().includes(term) ||
              reg.user.email?.toLowerCase().includes(term) ||
              reg.user.profile?.firstName?.toLowerCase().includes(term) ||
              reg.user.profile?.lastName?.toLowerCase().includes(term) ||
              reg.user.profile?.studentId?.toLowerCase().includes(term),
          )
        }

        setRegistrations(filtered)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch registrations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching registrations:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRegistration = (registrationId) => {
    router.push(`/dashboard/registration/card?id=${registrationId}`)
  }

  const handleDownloadPDF = async (registrationId) => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}/pdf`)

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Registration_Card_${registrationId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Registration card downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download registration card",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "DRAFT":
        return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.academicYear.name} - {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                Filter Results
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length > 0 ? (
                  registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        {registration.user.profile?.firstName} {registration.user.profile?.lastName}
                      </TableCell>
                      <TableCell>
                        {registration.user.profile?.studentId || registration.user.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        {registration.semester.academicYear.name} - {registration.semester.name}
                      </TableCell>
                      <TableCell>{registration.courseUploads.length}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>{new Date(registration.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewRegistration(registration.id)}>
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(registration.id)}>
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No registrations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
