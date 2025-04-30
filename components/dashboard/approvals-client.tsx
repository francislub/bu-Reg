"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { approveCourseRegistration, rejectCourseRegistration } from "@/lib/actions/course-registration-actions"
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

type Registration = {
  id: string
  studentId?: string
  studentName?: string
  courseId?: string
  courseName?: string
  courseCode?: string
  status: "PENDING" | "APPROVED" | "REJECTED" | string
  createdAt: Date
  updatedAt: Date
  semesterId?: string
  semesterName?: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    profile: {
      firstName?: string
      lastName?: string
    }
  }
  semester: {
    id: string
    name: string
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
    }
  }[]
}

type CourseUpload = {
  id: string
  registrationId: string
  courseId: string
  status: string
  registration: {
    id: string
    userId: string
    user: {
      id: string
      name: string
      email: string
      profile: {
        firstName: string
        lastName: string
      }
    }
    semester: {
      id: string
      name: string
    }
  }
  course: {
    id: string
    code: string
    name: string
    creditHours: number
  }
}

type ApprovalsClientProps = {
  pendingRegistrations: Registration[]
  pendingCourseUploads: CourseUpload[]
}

export function ApprovalsClient({ pendingRegistrations, pendingCourseUploads }: ApprovalsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [registrations, setRegistrations] = useState<Registration[]>(pendingRegistrations || [])
  const [courseUploads, setCourseUploads] = useState<CourseUpload[]>(pendingCourseUploads)
  const [searchTerm, setSearchTerm] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("registrations")

  const handleApproval = async (id: string, action: "approve" | "reject") => {
    setIsLoading((prev) => ({ ...prev, [id]: true }))

    try {
      let result
      if (action === "approve") {
        result = await approveCourseRegistration(id, "someApproverId") // Replace "someApproverId" with actual approver ID
      } else {
        result = await rejectCourseRegistration(id, "someApproverId") // Replace "someApproverId" with actual approver ID
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to update registration status")
      }

      // Update the local state
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, status: action === "approve" ? "APPROVED" : "REJECTED" } : reg)),
      )

      toast({
        title: action === "approve" ? "Registration Approved" : "Registration Rejected",
        description: `The course registration has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
        variant: action === "approve" ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error updating registration:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update registration status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
      router.refresh()
    }
  }

  // Group registrations by status
  const pendingRegs = registrations.filter((reg) => reg.status === "PENDING")
  const approvedRegs = registrations.filter((reg) => reg.status === "APPROVED")
  const rejectedRegs = registrations.filter((reg) => reg.status === "REJECTED")

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter(
    (registration) =>
      registration.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.semester.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter course uploads based on search term
  const filteredCourseUploads = courseUploads.filter(
    (courseUpload) =>
      courseUpload.registration.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.registration.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseUpload.course.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle registration approval
  const handleApproveRegistration = async (registrationId: string) => {
    setIsApproving(true)
    try {
      const result = await approveRegistration(registrationId)
      if (result.success) {
        // Update the local state
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
        // Remove the rejected registration from the list
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
        // Update the local state
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
        // Remove the rejected course from the list
        setCourseUploads((prev) => prev.filter((cu) => cu.id !== selectedItem))
        toast({
          title: "Success",
          description: "Course rejected successfully",
        })
        setIsDialogOpen(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registrations">
            Semester Registrations
            {registrations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {registrations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="courses">
            Course Registrations
            {courseUploads.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {courseUploads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Semester Registrations</CardTitle>
              <CardDescription>Approve or reject student semester registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {filteredRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">
                          {registration.user.profile?.firstName || ""}{" "}
                          {registration.user.profile?.lastName || registration.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.user.email} • {registration.semester.name}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Courses:</span> {registration.courseUploads.length}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRegistration(registration.id)}
                          disabled={isApproving}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectionDialog(registration.id, "registration")}
                          disabled={isRejecting}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending registrations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Pending Course Registrations</CardTitle>
              <CardDescription>Approve or reject individual course registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCourseUploads.length > 0 ? (
                <div className="space-y-4">
                  {filteredCourseUploads.map((courseUpload) => (
                    <div key={courseUpload.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">
                          {courseUpload.course.code}: {courseUpload.course.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{courseUpload.course.creditHours} Credit Hours</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Student:</span>{" "}
                          {courseUpload.registration.user.profile?.firstName || ""}{" "}
                          {courseUpload.registration.user.profile?.lastName || courseUpload.registration.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{courseUpload.registration.semester.name}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleApproveCourse(courseUpload.id)} disabled={isApproving}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectionDialog(courseUpload.id, "course")}
                          disabled={isRejecting}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending course registrations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this {activeTab === "registrations" ? "registration" : "course"}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
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
    </div>
  )
}
