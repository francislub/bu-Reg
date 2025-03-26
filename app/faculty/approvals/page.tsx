"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle, ClipboardList, Search, XCircle } from "lucide-react"

interface Registration {
  id: string
  studentId: string
  courseId: string
  status: string
  semester: string
  academicYear: string
  registeredAt: string
  student: {
    id: string
    name: string
    email: string
    registrationNo: string
  }
  course: {
    id: string
    code: string
    title: string
    credits: number
  }
}

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [loading, setLoading] = useState(true)
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchRegistrations()
    }
  }, [session])

  useEffect(() => {
    if (registrations.length > 0) {
      applyFilters()
    }
  }, [registrations, searchTerm, statusFilter])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      // Fetch registrations for courses taught by this faculty
      const res = await fetch(`/api/faculty/registrations?facultyId=${session.user.id}`)
      const data = await res.json()
      setRegistrations(data.registrations)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      useToast({
        title: "Error",
        description: "Failed to fetch student registrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...registrations]

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter((reg) => reg.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.student.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.course.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRegistrations(filtered)
  }

  const handleApproveConfirm = (registration: Registration) => {
    setCurrentRegistration(registration)
    setIsApproveDialogOpen(true)
  }

  const handleRejectConfirm = (registration: Registration) => {
    setCurrentRegistration(registration)
    setIsRejectDialogOpen(true)
  }

  const handleApprove = async () => {
    if (!currentRegistration) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/registrations/${currentRegistration.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      if (!res.ok) {
        throw new Error("Failed to approve registration")
      }

      useToast({
        title: "Success",
        description: "Registration approved successfully",
      })

      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === currentRegistration.id ? { ...reg, status: "APPROVED" } : reg)),
      )

      setIsApproveDialogOpen(false)
    } catch (error) {
      console.error("Error approving registration:", error)
      useToast({
        title: "Error",
        description: "Failed to approve registration",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!currentRegistration) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/registrations/${currentRegistration.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      })

      if (!res.ok) {
        throw new Error("Failed to reject registration")
      }

      useToast({
        title: "Success",
        description: "Registration rejected successfully",
      })

      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === currentRegistration.id ? { ...reg, status: "REJECTED" } : reg)),
      )

      setIsRejectDialogOpen(false)
    } catch (error) {
      console.error("Error rejecting registration:", error)
      useToast({
        title: "Error",
        description: "Failed to reject registration",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Student Registration Approvals</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by student name or ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Requests</CardTitle>
          <CardDescription>Review and approve student course registration requests for your courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading registration requests...</p>
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>{registration.student.registrationNo}</TableCell>
                      <TableCell className="font-medium">{registration.student.name}</TableCell>
                      <TableCell>
                        {registration.course.code}: {registration.course.title}
                      </TableCell>
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
                      <TableCell>
                        {registration.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                              onClick={() => handleApproveConfirm(registration)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                              onClick={() => handleRejectConfirm(registration)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No registration requests found.</p>
              {statusFilter ? (
                <p className="text-sm text-muted-foreground">Try selecting a different status filter.</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  There are no pending registration requests for your courses.
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {filteredRegistrations.length} of {registrations.length} registration requests
          </div>
        </CardFooter>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this registration request?
              {currentRegistration && (
                <div className="mt-2">
                  <p>
                    <strong>Student:</strong> {currentRegistration.student.name} (
                    {currentRegistration.student.registrationNo})
                  </p>
                  <p>
                    <strong>Course:</strong> {currentRegistration.course.code}: {currentRegistration.course.title}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={processing}>
              {processing ? "Processing..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this registration request?
              {currentRegistration && (
                <div className="mt-2">
                  <p>
                    <strong>Student:</strong> {currentRegistration.student.name} (
                    {currentRegistration.student.registrationNo})
                  </p>
                  <p>
                    <strong>Course:</strong> {currentRegistration.course.code}: {currentRegistration.course.title}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? "Processing..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

