"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, CheckSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  getAllCourseUploads,
  approveCourseUpload,
  rejectCourseUpload,
  bulkApproveCourseUploads,
} from "@/lib/actions/course-upload-actions"

type Semester = {
  id: string
  name: string
  startDate: Date
  endDate: Date
  academicYear: {
    id: string
    name: string
  }
}

type Department = {
  id: string
  name: string
}

type CourseUpload = {
  id: string
  status: string
  createdAt: Date
  rejectionReason?: string
  course: {
    id: string
    code: string
    title: string
    credits: number
    department: {
      id: string
      name: string
    }
  }
  user: {
    id: string
    name: string
    email: string
    profile: {
      firstName?: string
      lastName?: string
      studentId?: string
    }
  }
  semester: {
    id: string
    name: string
    academicYear: {
      name: string
    }
  }
}

type CourseApprovalsClientProps = {
  semesters: Semester[]
  departments: Department[]
}

export function CourseApprovalsClient({ semesters, departments }: CourseApprovalsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [courseUploads, setCourseUploads] = useState<CourseUpload[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedCourseUploadId, setSelectedCourseUploadId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [isBulkApproving, setIsBulkApproving] = useState(false)

  // Load course uploads when filters change
  useEffect(() => {
    fetchCourseUploads()
  }, [selectedSemesterId, selectedDepartmentId, selectedStatus, page])

  const fetchCourseUploads = async () => {
    setIsLoading(true)
    try {
      const result = await getAllCourseUploads({
        semesterId: selectedSemesterId || undefined,
        departmentId: selectedDepartmentId || undefined,
        status: selectedStatus || undefined,
        page,
        limit: 10,
      })

      if (result.success) {
        setCourseUploads(result.courseUploads)
        setTotalPages(result.pagination.pages)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch course uploads",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching course uploads:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter course uploads based on search term
  const filteredCourseUploads = courseUploads.filter(
    (cu) =>
      cu.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cu.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cu.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cu.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cu.user.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle course approval
  const handleApproveCourse = async (courseUploadId: string) => {
    setIsApproving(true)
    try {
      const result = await approveCourseUpload(courseUploadId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Course registration approved successfully",
        })
        fetchCourseUploads()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve course registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  // Open rejection dialog
  const openRejectDialog = (courseUploadId: string) => {
    setSelectedCourseUploadId(courseUploadId)
    setRejectionReason("")
    setIsDialogOpen(true)
  }

  // Handle course rejection
  const handleRejectCourse = async () => {
    if (!selectedCourseUploadId) return

    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setIsRejecting(true)
    try {
      const result = await rejectCourseUpload(selectedCourseUploadId, rejectionReason)
      if (result.success) {
        toast({
          title: "Success",
          description: "Course registration rejected successfully",
        })
        setIsDialogOpen(false)
        fetchCourseUploads()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject course registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setRejectionReason("")
      setSelectedCourseUploadId(null)
    }
  }

  // Handle bulk approval
  const handleBulkApprove = async () => {
    const selectedIds = Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id)

    if (selectedIds.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one course registration to approve",
        variant: "destructive",
      })
      return
    }

    setIsBulkApproving(true)
    try {
      const result = await bulkApproveCourseUploads(selectedIds)
      if (result.success) {
        toast({
          title: "Success",
          description: `${result.count} course registrations approved successfully`,
        })
        setSelectedItems({})
        fetchCourseUploads()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve course registrations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error bulk approving courses:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsBulkApproving(false)
    }
  }

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Toggle all items selection
  const toggleAllSelection = () => {
    if (Object.values(selectedItems).every((isSelected) => isSelected) && Object.keys(selectedItems).length > 0) {
      // If all are selected, unselect all
      setSelectedItems({})
    } else {
      // Otherwise, select all
      const newSelectedItems: Record<string, boolean> = {}
      filteredCourseUploads.forEach((cu) => {
        newSelectedItems[cu.id] = true
      })
      setSelectedItems(newSelectedItems)
    }
  }

  // Check if all items are selected
  const areAllSelected =
    Object.values(selectedItems).every((isSelected) => isSelected) &&
    Object.keys(selectedItems).length === filteredCourseUploads.length &&
    filteredCourseUploads.length > 0

  // Count selected items
  const selectedCount = Object.values(selectedItems).filter(Boolean).length

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Registration Approvals</CardTitle>
          <CardDescription>Review and manage course registrations by semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} ({semester.academicYear.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Filter by status" />
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

            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course code, title, or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {selectedStatus === "PENDING" && filteredCourseUploads.length > 0 && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={isBulkApproving || selectedCount === 0}
                  className="whitespace-nowrap"
                >
                  {isBulkApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Approve Selected ({selectedCount})
                    </>
                  )}
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCourseUploads.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedStatus === "PENDING" && (
                        <TableHead className="w-[50px]">
                          <Checkbox checked={areAllSelected} onCheckedChange={toggleAllSelection} />
                        </TableHead>
                      )}
                      <TableHead>Course</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourseUploads.map((courseUpload) => (
                      <TableRow key={courseUpload.id}>
                        {selectedStatus === "PENDING" && (
                          <TableCell>
                            <Checkbox
                              checked={!!selectedItems[courseUpload.id]}
                              onCheckedChange={() => toggleItemSelection(courseUpload.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <p className="font-medium">{courseUpload.course.code}</p>
                            <p className="text-sm text-muted-foreground">{courseUpload.course.title}</p>
                            <p className="text-xs text-muted-foreground">{courseUpload.course.credits} Credits</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {courseUpload.user.profile?.firstName || ""}{" "}
                              {courseUpload.user.profile?.lastName || courseUpload.user.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{courseUpload.user.email}</p>
                            {courseUpload.user.profile?.studentId && (
                              <p className="text-xs text-muted-foreground">ID: {courseUpload.user.profile.studentId}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{courseUpload.course.department.name}</TableCell>
                        <TableCell>
                          {courseUpload.semester.name} ({courseUpload.semester.academicYear.name})
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(courseUpload.status)}
                          {courseUpload.status === "REJECTED" && courseUpload.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1">Reason: {courseUpload.rejectionReason}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {courseUpload.status === "PENDING" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-red-500"
                                onClick={() => openRejectDialog(courseUpload.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-green-500"
                                onClick={() => handleApproveCourse(courseUpload.id)}
                                disabled={isApproving}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {courseUpload.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => router.push(`/dashboard/students/${courseUpload.user.id}`)}
                            >
                              View Student
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <p className="text-muted-foreground">No course registrations found</p>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this course registration. This will be visible to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason" className="mb-2 block">
              Rejection Reason
            </Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectCourse}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
