"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  XCircle,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  User,
  AlertCircle,
  Trash2,
  Home,
  Globe,
  Heart,
  Church,
  BookOpen,
  Info,
} from "lucide-react"
import { getUserProfile } from "@/lib/actions/user-actions"
import { getStudentCourses } from "@/lib/actions/course-actions"
import { approveCourseUpload, rejectCourseUpload } from "@/lib/actions/course-upload-actions"

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({})
  const [isRejecting, setIsRejecting] = useState<Record<string, boolean>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (
      !session ||
      (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")
    ) {
      router.push("/dashboard")
      return
    }

    const fetchStudentData = async () => {
      setIsLoading(true)
      try {
        // Fetch student profile
        const profileResult = await getUserProfile(params.id)
        if (profileResult.success) {
          setStudent(profileResult.user)
        } else {
          toast({
            title: "Error",
            description: profileResult.message || "Failed to fetch student profile",
            variant: "destructive",
          })
        }

        // Fetch student courses
        const coursesResult = await getStudentCourses(params.id)
        if (coursesResult.success) {
          setCourses(coursesResult.courseUploads)
        } else {
          toast({
            title: "Error",
            description: coursesResult.message || "Failed to fetch student courses",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [session, router, params.id, toast])

  const handleApprove = async (courseUploadId: string) => {
    setIsApproving((prev) => ({ ...prev, [courseUploadId]: true }))
    try {
      const result = await approveCourseUpload(courseUploadId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Course approved successfully",
        })

        // Update the course status in the local state
        setCourses((prevCourses) =>
          prevCourses.map((course) => (course.id === courseUploadId ? { ...course, status: "APPROVED" } : course)),
        )
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
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving((prev) => ({ ...prev, [courseUploadId]: false }))
      router.refresh()
    }
  }

  const openRejectDialog = (courseUploadId: string) => {
    setSelectedCourseId(courseUploadId)
    setRejectionReason("")
    setIsDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedCourseId) return

    setIsRejecting((prev) => ({ ...prev, [selectedCourseId]: true }))
    try {
      const result = await rejectCourseUpload(selectedCourseId, rejectionReason)
      if (result.success) {
        toast({
          title: "Success",
          description: "Course rejected successfully",
        })

        // Update the course status in the local state
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === selectedCourseId ? { ...course, status: "REJECTED", rejectionReason } : course,
          ),
        )

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
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting((prev) => ({ ...prev, [selectedCourseId]: false }))
      setSelectedCourseId(null)
      router.refresh()
    }
  }

  const handleDeleteStudent = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete student")
      }

      toast({
        title: "Success",
        description: "Student deleted successfully",
      })

      router.push("/dashboard/students")
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate total credits
  const calculateTotalCredits = () => {
    return courses
      .filter((course) => course.status === "APPROVED" || course.status === "PENDING")
      .reduce((total, course) => total + course.course.credits, 0)
  }

  if (
    !session ||
    (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")
  ) {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Student Details" text="View and manage student information">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Student
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the student account and all associated data
                  from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteStudent}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : student ? (
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Student's personal details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" /> Full Name
                    </span>
                    <span className="text-base font-medium">
                      {student.profile?.firstName} {student.profile?.middleName} {student.profile?.lastName}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </span>
                    <span className="text-base">{student.email}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Date of Birth
                    </span>
                    <span className="text-base">
                      {student.profile?.dateOfBirth
                        ? new Date(student.profile.dateOfBirth).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" /> Gender
                    </span>
                    <span className="text-base">{student.profile?.gender || "Not specified"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" /> Student ID
                    </span>
                    <span className="text-base">{student.profile?.studentId || student.id}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Globe className="h-4 w-4 mr-2" /> Nationality
                    </span>
                    <span className="text-base">{student.profile?.nationality || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> Contact
                    </span>
                    <span className="text-base">{student.profile?.phone || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Home className="h-4 w-4 mr-2" /> Address
                    </span>
                    <span className="text-base">{student.profile?.address || "Not specified"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Student's program and department details.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" /> Program
                    </span>
                    <span className="text-base">{student.profile?.program || "Not assigned"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" /> Program ID
                    </span>
                    <span className="text-base">{student.profile?.programId || "Not assigned"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" /> Department
                    </span>
                    <span className="text-base">
                      {student.profile?.departmentId ? student.profile.departmentId : "Not assigned"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Registration Date
                    </span>
                    <span className="text-base">{new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Other personal details.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Heart className="h-4 w-4 mr-2" /> Marital Status
                    </span>
                    <span className="text-base">{student.profile?.maritalStatus || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Church className="h-4 w-4 mr-2" /> Religion
                    </span>
                    <span className="text-base">{student.profile?.religion || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Church className="h-4 w-4 mr-2" /> Church
                    </span>
                    <span className="text-base">{student.profile?.church || "Not specified"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2" /> Responsibility
                    </span>
                    <span className="text-base">{student.profile?.responsibility || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2" /> Referral Source
                    </span>
                    <span className="text-base">{student.profile?.referralSource || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" /> Physically Disabled
                    </span>
                    <span className="text-base">{student.profile?.physicallyDisabled ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Courses the student is currently enrolled in.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-md flex justify-between items-center">
                  <div>
                    <span className="font-medium">Total Credits: </span>
                    <span className={`${calculateTotalCredits() > 24 ? "text-red-500 font-bold" : ""}`}>
                      {calculateTotalCredits()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">(Maximum allowed: 24)</span>
                  </div>
                  {calculateTotalCredits() > 24 && (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Credit limit exceeded</span>
                    </div>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length > 0 ? (
                      courses.map((courseUpload) => (
                        <TableRow key={courseUpload.id}>
                          <TableCell>{courseUpload.course.code}</TableCell>
                          <TableCell>{courseUpload.course.title}</TableCell>
                          <TableCell>{courseUpload.course.department.name}</TableCell>
                          <TableCell>{courseUpload.course.credits}</TableCell>
                          <TableCell>{courseUpload.semester.name}</TableCell>
                          <TableCell>
                            {courseUpload.status === "APPROVED" ? (
                              <Badge className="bg-green-100 text-green-800">Approved</Badge>
                            ) : courseUpload.status === "REJECTED" ? (
                              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No courses found for this student.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Registrations</CardTitle>
                <CardDescription>Manage student's course registration requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length > 0 ? (
                      courses
                        .filter((c) => c.status === "PENDING")
                        .map((courseUpload) => (
                          <TableRow key={courseUpload.id}>
                            <TableCell>
                              {courseUpload.course.code} - {courseUpload.course.title}
                            </TableCell>
                            <TableCell>{courseUpload.semester.name}</TableCell>
                            <TableCell>{courseUpload.course.credits}</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            </TableCell>
                            <TableCell>{new Date(courseUpload.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApprove(courseUpload.id)}
                                  disabled={isApproving[courseUpload.id]}
                                >
                                  {isApproving[courseUpload.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => openRejectDialog(courseUpload.id)}
                                  disabled={isRejecting[courseUpload.id]}
                                >
                                  {isRejecting[courseUpload.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No registration requests found for this student.
                        </TableCell>
                      </TableRow>
                    )}
                    {courses.length > 0 && courses.filter((c) => c.status === "PENDING").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No pending registration requests for this student.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Student not found or you don't have permission to view this student.
            </p>
          </CardContent>
        </Card>
      )}

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
            <Textarea
              placeholder="Enter rejection reason..."
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
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting[selectedCourseId || ""]}
            >
              {isRejecting[selectedCourseId || ""] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
