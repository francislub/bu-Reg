"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function RegistrationApprovalsList({ userRole, userId }: { userRole: string; userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourseUpload, setSelectedCourseUpload] = useState<any | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchQuery, statusFilter])

  const fetchRegistrations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/registrations")
      if (!response.ok) {
        throw new Error("Failed to fetch registrations")
      }
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch registrations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = [...registrations]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (reg) =>
          reg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === statusFilter.toUpperCase())
    }

    setFilteredRegistrations(filtered)
  }

  const handleApprove = async () => {
    if (!selectedCourseUpload) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/course-uploads/${selectedCourseUpload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: approvalStatus,
          comments,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update course status")
      }

      toast({
        title: `Course ${approvalStatus.toLowerCase()}`,
        description: `The course has been ${approvalStatus.toLowerCase()} successfully`,
        variant: "default",
      })

      // Refresh the data
      await fetchRegistrations()
      setIsApprovalDialogOpen(false)
      setComments("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingRegistrations = filteredRegistrations.filter((reg) => reg.status === "PENDING")
  const approvedRegistrations = filteredRegistrations.filter((reg) => reg.status === "APPROVED")
  const rejectedRegistrations = filteredRegistrations.filter((reg) => reg.status === "REJECTED")

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={fetchRegistrations} disabled={isLoading}>
          <Filter className="mr-2 h-4 w-4" />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Requests</CardTitle>
          <CardDescription>Review and manage student registration requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending{" "}
                <Badge variant="secondary" className="ml-2">
                  {pendingRegistrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved{" "}
                <Badge variant="secondary" className="ml-2">
                  {approvedRegistrations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected{" "}
                <Badge variant="secondary" className="ml-2">
                  {rejectedRegistrations.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingRegistrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending registrations</div>
              ) : (
                pendingRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    userRole={userRole}
                    onApprove={(courseUpload) => {
                      setSelectedCourseUpload(courseUpload)
                      setApprovalStatus("APPROVED")
                      setIsApprovalDialogOpen(true)
                    }}
                    onReject={(courseUpload) => {
                      setSelectedCourseUpload(courseUpload)
                      setApprovalStatus("REJECTED")
                      setIsApprovalDialogOpen(true)
                    }}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : approvedRegistrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No approved registrations</div>
              ) : (
                approvedRegistrations.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} userRole={userRole} viewOnly />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : rejectedRegistrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No rejected registrations</div>
              ) : (
                rejectedRegistrations.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} userRole={userRole} viewOnly />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalStatus === "APPROVED" ? "Approve" : "Reject"} Course Registration</DialogTitle>
            <DialogDescription>
              {approvalStatus === "APPROVED"
                ? "Approve this course registration request"
                : "Provide a reason for rejecting this course registration"}
            </DialogDescription>
          </DialogHeader>

          {selectedCourseUpload && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium">Student</h3>
                <p className="text-sm">{selectedCourseUpload.user?.name}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium">Course</h3>
                <p className="text-sm">
                  {selectedCourseUpload.course?.code}: {selectedCourseUpload.course?.title}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Comments (optional)</h3>
                <Textarea
                  placeholder="Add any comments or feedback..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={approvalStatus === "APPROVED" ? "default" : "destructive"}
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : approvalStatus === "APPROVED" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RegistrationCard({
  registration,
  userRole,
  onApprove,
  onReject,
  viewOnly = false,
}: {
  registration: any
  userRole: string
  onApprove?: (courseUpload: any) => void
  onReject?: (courseUpload: any) => void
  viewOnly?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="space-y-1">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">{registration.user.name}</h3>
            <Badge
              variant={
                registration.status === "PENDING"
                  ? "secondary"
                  : registration.status === "APPROVED"
                    ? "default"
                    : "destructive"
              }
              className="ml-2"
            >
              {registration.status.charAt(0) + registration.status.slice(1).toLowerCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{registration.user.email}</p>
          <p className="text-xs text-muted-foreground">
            Semester: {registration.semester.name} | Courses: {registration.courseUploads.length}
          </p>
        </div>
        <div className="flex items-center mt-2 md:mt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? "Hide Details" : "View Details"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Registered Courses</h4>
          <div className="space-y-2">
            {registration.courseUploads.map((courseUpload: any) => (
              <div
                key={courseUpload.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white border rounded-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium">
                      {courseUpload.course.code}: {courseUpload.course.title}
                    </p>
                    <Badge
                      variant={
                        courseUpload.status === "PENDING"
                          ? "secondary"
                          : courseUpload.status === "APPROVED"
                            ? "default"
                            : "destructive"
                      }
                      className="ml-2"
                    >
                      {courseUpload.status.charAt(0) + courseUpload.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {courseUpload.course.credits} Credit Hours | {courseUpload.course.department.name}
                  </p>
                </div>

                {!viewOnly && courseUpload.status === "PENDING" && (
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onApprove && onApprove(courseUpload)
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReject && onReject(courseUpload)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
