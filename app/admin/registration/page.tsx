"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
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
import { MoreHorizontal, Search, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react"

export default function RegistrationPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentRegistration, setCurrentRegistration] = useState(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRegistrations()
  }, [activeTab, page])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)

      let url = `/api/registrations?page=${page}&limit=10`
      if (activeTab !== "all") {
        url += `&status=${activeTab.toUpperCase()}`
      }

      const res = await fetch(url)
      const data = await res.json()

      setRegistrations(data.registrations)
      setTotalPages(data.meta.pages)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveConfirm = (registration) => {
    setCurrentRegistration(registration)
    setIsApproveDialogOpen(true)
  }

  const handleRejectConfirm = (registration) => {
    setCurrentRegistration(registration)
    setIsRejectDialogOpen(true)
  }

  const handleApprove = async () => {
    try {
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

      toast({
        title: "Success",
        description: "Registration approved successfully",
      })

      setIsApproveDialogOpen(false)
      fetchRegistrations()
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to approve registration",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    try {
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

      toast({
        title: "Success",
        description: "Registration rejected successfully",
      })

      setIsRejectDialogOpen(false)
      fetchRegistrations()
    } catch (error) {
      console.error("Error rejecting registration:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reject registration",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = async (id) => {
    try {
      const res = await fetch(`/api/registrations/${id}`)
      const data = await res.json()

      // Open a modal or navigate to details page
      console.log("Registration details:", data)

      toast({
        title: "Registration Details",
        description: `Viewing details for ${data.student.name}'s registration for ${data.course.code}`,
      })
    } catch (error) {
      console.error("Error fetching registration details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch registration details",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pending
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.student.registrationNo && reg.student.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reg.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.course.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Course Registrations</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search registrations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Semester</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                          <span>Loading registrations...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reg.student.name}</div>
                            <div className="text-sm text-muted-foreground">{reg.student.registrationNo || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {reg.course.code}: {reg.course.title}
                        </TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <div>{reg.semester}</div>
                            <div className="text-sm text-muted-foreground">{reg.academicYear}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(reg.registeredAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(reg.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {reg.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    className="text-green-600 dark:text-green-400"
                                    onClick={() => handleApproveConfirm(reg)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 dark:text-red-400"
                                    onClick={() => handleRejectConfirm(reg)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No registrations found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredRegistrations.length} of {registrations.length} registrations
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this registration? This will enroll the student in the course.
              {currentRegistration && (
                <div className="mt-2">
                  <p>
                    <strong>Student:</strong> {currentRegistration.student.name}
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
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve
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
              Are you sure you want to reject this registration? The student will not be enrolled in the course.
              {currentRegistration && (
                <div className="mt-2">
                  <p>
                    <strong>Student:</strong> {currentRegistration.student.name}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

