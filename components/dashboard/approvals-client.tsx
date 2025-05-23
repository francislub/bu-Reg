"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Clock,
  User,
  BookOpen,
  Calendar,
  Phone,
  GraduationCap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { approveRegistration, rejectRegistration } from "@/lib/actions/registration-actions"
import { approveCourseUpload, rejectCourseUpload } from "@/lib/actions/course-upload-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Registration = {
  id: string
  status: "PENDING" | "APPROVED" | "REJECTED" | string
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    name: string
    email: string
    profile: {
      firstName?: string
      lastName?: string
      studentId?: string
      phoneNumber?: string
      program?: string
      yearOfStudy?: number
    }
  }
  semester: {
    id: string
    name: string
    academicYear: {
      id: string
      year: string
    }
  }
  courseUploads: {
    id: string
    courseId: string
    status: string
    course: {
      id: string
      code: string
      name: string
      creditHours: number
      department: {
        id: string
        name: string
      }
    }
  }[]
}

type CourseUpload = {
  id: string
  registrationId: string
  courseId: string
  status: string
  createdAt: Date
  registration: {
    id: string
    userId: string
    user: {
      id: string
      name: string
      email: string
      profile: {
        firstName?: string
        lastName?: string
        studentId?: string
        phoneNumber?: string
        program?: string
        yearOfStudy?: number
      }
    }
    semester: {
      id: string
      name: string
      academicYear: {
        id: string
        year: string
      }
    }
  }
  course: {
    id: string
    code: string
    name: string
    creditHours: number
    department: {
      id: string
      name: string
    }
  }
}

type ApprovalStats = {
  totalPending: number
  totalApproved: number
  totalRejected: number
  pendingThisWeek: number
}

type ApprovalsClientProps = {
  pendingRegistrations: Registration[]
  pendingCourseUploads: CourseUpload[]
  approvalStats: ApprovalStats
}

export function ApprovalsClient({ pendingRegistrations, pendingCourseUploads, approvalStats }: ApprovalsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [registrations, setRegistrations] = useState<Registration[]>(pendingRegistrations || [])
  const [courseUploads, setCourseUploads] = useState<CourseUpload[]>(pendingCourseUploads || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("registrations")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filter registrations based on search term and status
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.semester.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || registration.status.toLowerCase() === filterStatus

    return matchesSearch && matchesStatus
  })

  // Filter course uploads based on search term
  const filteredCourseUploads = courseUploads.filter((courseUpload) => {
    const matchesSearch =
      courseUpload.registration.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.registration.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.course.department.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Handle registration approval
  const handleApproveRegistration = async (registrationId: string) => {
    setIsApproving(true)
    try {
      const result = await approveRegistration(registrationId)
      if (result.success) {
        setRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId))
        toast({
          title: "Success",
          description: "Registration approved successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  // Handle registration rejection
  const handleRejectRegistration = async () => {
    if (!selectedItem) return

    setIsRejecting(true)
    try {
      const result = await rejectRegistration(selectedItem, rejectionReason)
      if (result.success) {
        setRegistrations((prev) => prev.filter((reg) => reg.id !== selectedItem))
        toast({
          title: "Success",
          description: "Registration rejected successfully",
        })
        setIsDialogOpen(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setRejectionReason("")
      setSelectedItem(null)
    }
  }

  // Handle course approval
  const handleApproveCourse = async (courseUploadId: string) => {
    setIsApproving(true)
    try {
      const result = await approveCourseUpload(courseUploadId)
      if (result.success) {
        setCourseUploads((prev) => prev.filter((cu) => cu.id !== courseUploadId))
        toast({
          title: "Success",
          description: "Course approved successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve course",
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

  // Handle course rejection
  const handleRejectCourse = async () => {
    if (!selectedItem) return

    setIsRejecting(true)
    try {
      const result = await rejectCourseUpload(selectedItem, rejectionReason)
      if (result.success) {
        setCourseUploads((prev) => prev.filter((cu) => cu.id !== selectedItem))
        toast({
          title: "Success",
          description: "Course rejected successfully",
        })
        setIsDialogOpen(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject course",
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
      setSelectedItem(null)
    }
  }

  // Open rejection dialog
  const openRejectionDialog = (id: string, type: "registration" | "course") => {
    setSelectedItem(id)
    setActiveTab(type === "registration" ? "registrations" : "courses")
    setIsDialogOpen(true)
  }

  // Open details dialog
  const openDetailsDialog = (registration: Registration) => {
    setSelectedRegistration(registration)
    setIsDetailsDialogOpen(true)
  }

  // Get student display name
  const getStudentName = (user: any) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`
    }
    return user.name || user.email
  }

  // Get student initials
  const getStudentInitials = (user: any) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`
    }
    if (user.name) {
      const names = user.name.split(" ")
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : names[0][0]
    }
    return user.email[0].toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{approvalStats.totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvalStats.totalApproved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{approvalStats.totalRejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{approvalStats.pendingThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, student ID, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Semester Registrations
            {registrations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {registrations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Registrations
            {courseUploads.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {courseUploads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Semester Registrations</CardTitle>
              <CardDescription>Review and approve student semester registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {filteredRegistrations.map((registration) => (
                    <Card key={registration.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{getStudentInitials(registration.user)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                              <div>
                                <h3 className="font-semibold text-lg">{getStudentName(registration.user)}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {registration.user.profile?.studentId || "N/A"}
                                  </span>
                                  <span>{registration.user.email}</span>
                                  {registration.user.profile?.phoneNumber && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {registration.user.profile.phoneNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <Badge variant="outline">
                                  {registration.semester.academicYear.year} {registration.semester.name}
                                </Badge>
                                {registration.user.profile?.program && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <GraduationCap className="w-3 h-3" />
                                    {registration.user.profile.program}
                                  </span>
                                )}
                                {registration.user.profile?.yearOfStudy && (
                                  <span className="text-muted-foreground">
                                    Year {registration.user.profile.yearOfStudy}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{registration.courseUploads.length} courses</Badge>
                                <span className="text-sm text-muted-foreground">
                                  Submitted {new Date(registration.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRegistration(registration.id)}
                                disabled={isApproving}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRejectionDialog(registration.id, "registration")}
                                disabled={isRejecting}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDetailsDialog(registration)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending registrations</h3>
                  <p className="text-muted-foreground">
                    All registrations have been processed or no new submissions found.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Course Registrations</CardTitle>
              <CardDescription>Review and approve individual course registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCourseUploads.length > 0 ? (
                <div className="space-y-4">
                  {filteredCourseUploads.map((courseUpload) => (
                    <Card key={courseUpload.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {courseUpload.course.code}: {courseUpload.course.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{courseUpload.course.department.name}</span>
                                <span>{courseUpload.course.creditHours} Credit Hours</span>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getStudentInitials(courseUpload.registration.user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getStudentName(courseUpload.registration.user)}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{courseUpload.registration.user.profile?.studentId || "N/A"}</span>
                                  <span>
                                    {courseUpload.registration.semester.academicYear.year}{" "}
                                    {courseUpload.registration.semester.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Submitted {new Date(courseUpload.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveCourse(courseUpload.id)}
                              disabled={isApproving}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRejectionDialog(courseUpload.id, "course")}
                              disabled={isRejecting}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending course registrations</h3>
                  <p className="text-muted-foreground">
                    All course registrations have been processed or no new submissions found.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this {activeTab === "registrations" ? "registration" : "course"}.
              This will be sent to the student via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for rejection</Label>
            <Textarea
              id="reason"
              placeholder="Enter a clear and helpful rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={activeTab === "registrations" ? handleRejectRegistration : handleRejectCourse}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>Complete information about this registration</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getStudentInitials(selectedRegistration.user)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{getStudentName(selectedRegistration.user)}</h3>
                  <p className="text-muted-foreground">{selectedRegistration.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student ID</Label>
                  <p className="text-sm">{selectedRegistration.user.profile?.studentId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm">{selectedRegistration.user.profile?.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Program</Label>
                  <p className="text-sm">{selectedRegistration.user.profile?.program || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Year of Study</Label>
                  <p className="text-sm">{selectedRegistration.user.profile?.yearOfStudy || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Semester</Label>
                <p className="text-sm">
                  {selectedRegistration.semester.academicYear.year} {selectedRegistration.semester.name}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Registered Courses ({selectedRegistration.courseUploads.length})
                </Label>
                <div className="mt-2 space-y-2">
                  {selectedRegistration.courseUploads.map((courseUpload) => (
                    <div key={courseUpload.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {courseUpload.course.code}: {courseUpload.course.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {courseUpload.course.department.name} • {courseUpload.course.creditHours} credits
                        </p>
                      </div>
                      <Badge variant={courseUpload.status === "APPROVED" ? "default" : "secondary"}>
                        {courseUpload.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm">{new Date(selectedRegistration.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedRegistration.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
