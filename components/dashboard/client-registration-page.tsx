"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, PlusCircle, Trash2, Loader2, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { registerForSemester, submitRegistration, cancelRegistration } from "@/lib/actions/registration-actions"
import { addCourseToRegistration, removeCourseFromRegistration } from "@/lib/actions/course-registration-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types based on your schema
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

type Course = {
  id: string
  code: string
  title: string
  credits: number
  description?: string
  department: {
    id: string
    name: string
  }
}

type CourseUpload = {
  id: string
  courseId: string
  registrationId: string
  status: string
  rejectionReason?: string
  course: Course
}

type Registration = {
  id: string
  userId: string
  semesterId: string
  status: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
  semester: Semester
  courseUploads?: CourseUpload[]
}

export default function ClientRegistrationPage({
  initialRegistration,
  availableCourses,
}: {
  initialRegistration?: Registration | null
  availableCourses: Course[]
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("")
  const [registration, setRegistration] = useState<Registration | null>(initialRegistration || null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("")
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false)
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Calculate total credit hours
  const totalCreditHours =
    registration?.courseUploads?.reduce((total, courseUpload) => total + courseUpload.course.credits, 0) || 0

  // Credit hour limit
  const CREDIT_HOUR_LIMIT = 24
  const creditHourPercentage = (totalCreditHours / CREDIT_HOUR_LIMIT) * 100

  // Extract unique departments from available courses
  const departments = Array.from(new Set(availableCourses.map((course) => course.department.id))).map(
    (departmentId) => {
      const course = availableCourses.find((c) => c.department.id === departmentId)
      return {
        id: departmentId,
        name: course?.department.name || "Unknown Department",
      }
    },
  )

  useEffect(() => {
    if (initialRegistration) {
      setRegistration(initialRegistration)
      setSelectedSemesterId(initialRegistration.semesterId)
    }

    // Fetch active semesters
    const fetchSemesters = async () => {
      try {
        setIsLoadingSemesters(true)
        const response = await fetch(`/api/semesters?active=true`)
        const data = await response.json()

        if (data.success) {
          setSemesters(data.semesters)
        } else {
          console.error("Failed to fetch semesters:", data.message)
        }
      } catch (error) {
        console.error("Error fetching semesters:", error)
      } finally {
        setIsLoadingSemesters(false)
      }
    }

    // Fetch user profile to get program and department
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/users/${session.user.id}`)
        const data = await response.json()

        if (data.success) {
          setUserProfile(data.user)
          // Set department filter based on user's department
          if (data.user.profile?.departmentId) {
            setDepartmentFilter(data.user.profile.departmentId)
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchSemesters()
    fetchUserProfile()
  }, [initialRegistration, session])

  // Filter courses based on search term and department filter
  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = !departmentFilter || course.department.id === departmentFilter

    return matchesSearch && matchesDepartment
  })

  // Check if course is already selected
  const isCourseSelected = (courseId: string) => {
    return registration?.courseUploads?.some((cu) => cu.courseId === courseId) || false
  }

  // Handle semester registration
  const handleRegister = async () => {
    if (!selectedSemesterId) {
      toast({
        title: "Error",
        description: "Please select a semester",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)
    try {
      const result = await registerForSemester(session?.user?.id || "", selectedSemesterId)
      if (result.success) {
        setRegistration(result.registration)
        toast({
          title: "Success",
          description: "Successfully registered for semester",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to register for semester",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error registering for semester:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  // Handle adding a course
  const handleAddCourse = async (courseId: string) => {
    if (!registration) {
      toast({
        title: "Error",
        description: "Please register for a semester first",
        variant: "destructive",
      })
      return
    }

    // Check credit hour limit
    const courseToAdd = availableCourses.find((c) => c.id === courseId)
    if (courseToAdd && totalCreditHours + courseToAdd.credits > CREDIT_HOUR_LIMIT) {
      toast({
        title: "Credit Hour Limit Exceeded",
        description: `Adding this course would exceed the ${CREDIT_HOUR_LIMIT} credit hour limit`,
        variant: "destructive",
      })
      return
    }

    setIsAddingCourse(true)
    try {
      const result = await addCourseToRegistration(registration.id, courseId)
      if (result.success) {
        // Update the registration with the new course
        setRegistration((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            courseUploads: [...(prev.courseUploads || []), result.courseUpload],
          }
        })
        toast({
          title: "Success",
          description: "Course added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAddingCourse(false)
      setIsDialogOpen(false)
    }
  }

  // Handle removing a course
  const handleRemoveCourse = async (courseUploadId: string) => {
    if (!registration) return

    try {
      const result = await removeCourseFromRegistration(courseUploadId)
      if (result.success) {
        // Update the registration by removing the course
        setRegistration((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            courseUploads: prev.courseUploads?.filter((cu) => cu.id !== courseUploadId) || [],
          }
        })
        toast({
          title: "Success",
          description: "Course removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle submitting registration
  const handleSubmitRegistration = async () => {
    if (!registration) {
      toast({
        title: "Error",
        description: "No registration to submit",
        variant: "destructive",
      })
      return
    }

    if (!registration.courseUploads || registration.courseUploads.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one course before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitRegistration(registration.id)
      if (result.success) {
        setRegistration(result.registration)
        toast({
          title: "Success",
          description: "Registration submitted successfully. Waiting for approval.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancelling registration
  const handleCancelRegistration = async () => {
    if (!registration) return

    setIsCancelling(true)
    try {
      const result = await cancelRegistration(registration.id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Registration cancelled successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to cancel registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
      setConfirmCancelDialogOpen(false)
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
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
            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      case "PENDING":
        return <Badge variant="secondary">Pending Approval</Badge>
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {!registration ? (
        <Card>
          <CardHeader>
            <CardTitle>Register for a Semester</CardTitle>
            <CardDescription>
              Select a semester to register for. You can add courses after registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId} disabled={isLoadingSemesters}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder={isLoadingSemesters ? "Loading semesters..." : "Select a semester"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSemesters ? (
                      <SelectItem value="" disabled>
                        Loading semesters...
                      </SelectItem>
                    ) : semesters.length > 0 ? (
                      semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name} ({semester.academicYear.name})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-semesters" disabled>
                        No active semesters available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRegister} disabled={isRegistering || !selectedSemesterId}>
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register for Semester"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Status</CardTitle>
              <CardDescription>
                {registration.semester.name} ({registration.semester.academicYear.name})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <StatusBadge status={registration.status} />
                    {registration.status === "REJECTED" && registration.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {registration.rejectionReason}</p>
                    )}
                  </div>
                  {registration.status === "APPROVED" && (
                    <Button onClick={() => router.push(`/dashboard/registration/card?id=${registration.id}`)}>
                      <FileText className="w-4 h-4 mr-2" /> Print Registration Card
                    </Button>
                  )}
                  {(registration.status === "DRAFT" || registration.status === "PENDING") && (
                    <Button variant="outline" onClick={() => setConfirmCancelDialogOpen(true)} disabled={isCancelling}>
                      Cancel Registration
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Credit Hours</p>
                    <p className="text-sm font-medium">
                      {totalCreditHours} / {CREDIT_HOUR_LIMIT}
                    </p>
                  </div>
                  <Progress value={creditHourPercentage} className="h-2" />
                </div>

                {(registration.status === "DRAFT" || registration.status === "PENDING") && (
                  <Alert variant={creditHourPercentage < 100 ? "default" : "destructive"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Credit Hour Limit</AlertTitle>
                    <AlertDescription>
                      {creditHourPercentage < 100
                        ? `You can add up to ${CREDIT_HOUR_LIMIT - totalCreditHours} more credit hours.`
                        : "You have reached the maximum credit hour limit."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registered Courses</CardTitle>
                <CardDescription>Courses you have registered for this semester</CardDescription>
              </div>
              {registration.status === "DRAFT" && creditHourPercentage < 100 && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="w-4 h-4 mr-2" /> Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Course</DialogTitle>
                      <DialogDescription>Search and select courses to add to your registration.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Input
                          placeholder="Search courses by name, code, or department..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Departments</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div>
                                <p className="font-medium">
                                  {course.code}: {course.title}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">{course.credits} Credit Hours</p>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <p className="text-sm text-muted-foreground">{course.department.name}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddCourse(course.id)}
                                disabled={
                                  isAddingCourse ||
                                  isCourseSelected(course.id) ||
                                  totalCreditHours + course.credits > CREDIT_HOUR_LIMIT
                                }
                              >
                                {isCourseSelected(course.id)
                                  ? "Added"
                                  : totalCreditHours + course.credits > CREDIT_HOUR_LIMIT
                                    ? "Exceeds Limit"
                                    : "Add"}
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-4">
                            No courses found matching your search
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {registration.courseUploads && registration.courseUploads.length > 0 ? (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Courses</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="space-y-4">
                      {registration.courseUploads.map((courseUpload) => (
                        <div key={courseUpload.id} className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {courseUpload.course.code}: {courseUpload.course.title}
                              </p>
                              <StatusBadge status={courseUpload.status} />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {courseUpload.course.credits} Credit Hours
                              </p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">{courseUpload.course.department.name}</p>
                            </div>
                            {courseUpload.status === "REJECTED" && courseUpload.rejectionReason && (
                              <p className="text-xs text-red-500 mt-1">Reason: {courseUpload.rejectionReason}</p>
                            )}
                          </div>
                          {registration.status === "DRAFT" && (
                            <Button size="sm" variant="outline" onClick={() => handleRemoveCourse(courseUpload.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pending">
                    <div className="space-y-4">
                      {registration.courseUploads
                        .filter((cu) => cu.status === "PENDING")
                        .map((courseUpload) => (
                          <div
                            key={courseUpload.id}
                            className="flex items-center justify-between p-4 border rounded-md"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {courseUpload.course.code}: {courseUpload.course.title}
                                </p>
                                <StatusBadge status={courseUpload.status} />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {courseUpload.course.credits} Credit Hours
                                </p>
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-sm text-muted-foreground">{courseUpload.course.department.name}</p>
                              </div>
                            </div>
                            {registration.status === "DRAFT" && (
                              <Button size="sm" variant="outline" onClick={() => handleRemoveCourse(courseUpload.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      {registration.courseUploads.filter((cu) => cu.status === "PENDING").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No pending courses</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="approved">
                    <div className="space-y-4">
                      {registration.courseUploads
                        .filter((cu) => cu.status === "APPROVED")
                        .map((courseUpload) => (
                          <div
                            key={courseUpload.id}
                            className="flex items-center justify-between p-4 border rounded-md"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {courseUpload.course.code}: {courseUpload.course.title}
                                </p>
                                <StatusBadge status={courseUpload.status} />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {courseUpload.course.credits} Credit Hours
                                </p>
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-sm text-muted-foreground">{courseUpload.course.department.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {registration.courseUploads.filter((cu) => cu.status === "APPROVED").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No approved courses yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="rejected">
                    <div className="space-y-4">
                      {registration.courseUploads
                        .filter((cu) => cu.status === "REJECTED")
                        .map((courseUpload) => (
                          <div
                            key={courseUpload.id}
                            className="flex items-center justify-between p-4 border rounded-md"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {courseUpload.course.code}: {courseUpload.course.title}
                                </p>
                                <StatusBadge status={courseUpload.status} />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">
                                  {courseUpload.course.credits} Credit Hours
                                </p>
                                <span className="text-xs text-muted-foreground">•</span>
                                <p className="text-sm text-muted-foreground">{courseUpload.course.department.name}</p>
                              </div>
                              {courseUpload.rejectionReason && (
                                <p className="text-xs text-red-500 mt-1">Reason: {courseUpload.rejectionReason}</p>
                              )}
                            </div>
                            {registration.status === "DRAFT" && (
                              <Button size="sm" variant="outline" onClick={() => handleRemoveCourse(courseUpload.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      {registration.courseUploads.filter((cu) => cu.status === "REJECTED").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No rejected courses</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No courses added yet</p>
                  {registration.status === "DRAFT" && (
                    <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <PlusCircle className="w-4 h-4 mr-2" /> Add Your First Course
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            {registration.status === "DRAFT" && registration.courseUploads && registration.courseUploads.length > 0 && (
              <CardFooter>
                <Button
                  onClick={handleSubmitRegistration}
                  disabled={isSubmitting || registration.courseUploads.length === 0}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration for Approval"
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}

      {/* Cancel Registration Confirmation Dialog */}
      <Dialog open={confirmCancelDialogOpen} onOpenChange={setConfirmCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this registration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancelDialogOpen(false)}>
              No, Keep Registration
            </Button>
            <Button variant="destructive" onClick={handleCancelRegistration} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
