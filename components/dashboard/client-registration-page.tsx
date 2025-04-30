"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"
import { dropCourseFromRegistration } from "@/lib/actions/course-registration-actions"
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Printer,
  Trash2,
  XCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Course = {
  id: string
  code: string
  name: string
  description: string
  creditHours: number
  departmentId: string
  department: {
    id: string
    name: string
    code: string
  }
}

type CourseUpload = {
  id: string
  courseId: string
  registrationId: string
  status: string
  createdAt: string
  updatedAt: string
  course: Course
}

type Registration = {
  id: string
  userId: string
  semesterId: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    profile: {
      firstName: string
      lastName: string
      studentId: string
      program: string
    }
  }
  semester: {
    id: string
    name: string
    startDate: string
    endDate: string
  }
  courseUploads?: CourseUpload[]
}

type ClientRegistrationPageProps = {
  initialRegistration: Registration | null
  availableCourses: Course[]
}

export default function ClientRegistrationPage({
  initialRegistration,
  availableCourses = [],
}: ClientRegistrationPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [registration, setRegistration] = useState<Registration | null>(initialRegistration)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [showPrintCard, setShowPrintCard] = useState(false)

  // Filter out courses that are already registered
  const registeredCourseIds = registration?.courseUploads?.map((upload) => upload.courseId) || []
  const availableCoursesToAdd = availableCourses?.filter((course) => !registeredCourseIds.includes(course.id)) || []

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const handleAddCourses = async () => {
    if (selectedCourses.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course to add",
        variant: "destructive",
      })
      return
    }

    if (!registration) {
      toast({
        title: "No active registration",
        description: "You need to start a registration first",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/course-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: registration.id,
          courseIds: selectedCourses,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Courses added to your registration",
        })
        // Refresh the page to get updated data
        router.refresh()
        // Clear selected courses
        setSelectedCourses([])
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding courses:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDropCourse = async () => {
    if (!courseToDelete) return

    setIsLoading(true)

    try {
      const result = await dropCourseFromRegistration(courseToDelete)

      if (result.success) {
        toast({
          title: "Success",
          description: "Course dropped successfully",
        })
        // Update local state
        if (registration && registration.courseUploads) {
          setRegistration({
            ...registration,
            courseUploads: registration.courseUploads.filter((upload) => upload.id !== courseToDelete),
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to drop course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error dropping course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setCourseToDelete(null)
    }
  }

  const handleSubmitRegistration = async () => {
    if (!registration) return

    if (!registration.courseUploads || registration.courseUploads.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please add at least one course to your registration",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/registrations/${registration.id}/submit`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Registration submitted successfully",
        })
        // Update local state
        setRegistration({
          ...registration,
          status: "PENDING",
        })
        // Show confirmation dialog
        setShowConfirmation(true)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit registration",
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

  // Calculate total credit hours
  const totalCreditHours =
    registration?.courseUploads?.reduce((total, upload) => total + (upload.course.creditHours || 0), 0) || 0

  return (
    <div className="space-y-6">
      {!registration ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Registration</CardTitle>
            <CardDescription>You don't have an active registration for the current semester.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact the registrar's office to start a new registration for the current semester.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Course Registration</h2>
              <p className="text-muted-foreground">Register for courses for {registration.semester.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  registration.status === "DRAFT"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    : registration.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : registration.status === "APPROVED"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {registration.status === "DRAFT" ? (
                  <Clock className="mr-1 h-3 w-3" />
                ) : registration.status === "PENDING" ? (
                  <AlertCircle className="mr-1 h-3 w-3" />
                ) : registration.status === "APPROVED" ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {registration.status}
              </Badge>
              {registration.status === "APPROVED" && (
                <Button size="sm" variant="outline" onClick={() => setShowPrintCard(true)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Registration Card
                </Button>
              )}
            </div>
          </div>

          {registration.status === "DRAFT" ? (
            <Tabs defaultValue="registered">
              <TabsList>
                <TabsTrigger value="registered">
                  Registered Courses{" "}
                  <Badge variant="secondary" className="ml-2">
                    {registration.courseUploads?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="available">
                  Available Courses{" "}
                  <Badge variant="secondary" className="ml-2">
                    {availableCoursesToAdd.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registered" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Registered Courses</CardTitle>
                    <CardDescription>Courses you have registered for {registration.semester.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!registration.courseUploads || registration.courseUploads.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No courses registered yet</p>
                        <p className="text-sm text-muted-foreground">Add courses from the Available Courses tab</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {registration.courseUploads.map((upload) => (
                          <div key={upload.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div>
                              <p className="font-medium">
                                {upload.course.code}: {upload.course.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {upload.course.creditHours} Credit Hours • {upload.course.department.name}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setCourseToDelete(upload.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Drop
                            </Button>
                          </div>
                        ))}

                        <div className="flex justify-between items-center p-4 border-t">
                          <div>
                            <p className="font-medium">Total Credit Hours</p>
                            <p className="text-sm text-muted-foreground">Total credits for this semester</p>
                          </div>
                          <p className="text-xl font-bold">{totalCreditHours}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      {registration.courseUploads?.length || 0} courses registered
                    </p>
                    <Button
                      onClick={handleSubmitRegistration}
                      disabled={!registration.courseUploads || registration.courseUploads.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit Registration
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Courses</CardTitle>
                    <CardDescription>
                      Courses available for registration in {registration.semester.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availableCoursesToAdd.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">You've registered for all available courses</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {availableCoursesToAdd.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`course-${course.id}`}
                                checked={selectedCourses.includes(course.id)}
                                onChange={() => handleCourseSelection(course.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <div>
                                <label htmlFor={`course-${course.id}`} className="font-medium cursor-pointer">
                                  {course.code}: {course.name}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  {course.creditHours} Credit Hours • {course.department.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">{selectedCourses.length} courses selected</p>
                    <Button onClick={handleAddCourses} disabled={selectedCourses.length === 0 || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>Add Selected Courses</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>Your registration for {registration.semester.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {registration.status === "PENDING" && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Registration Pending</AlertTitle>
                      <AlertDescription>
                        Your registration is pending approval from the registrar's office. You will be notified once
                        it's approved.
                      </AlertDescription>
                    </Alert>
                  )}

                  {registration.status === "REJECTED" && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Registration Rejected</AlertTitle>
                      <AlertDescription>
                        Your registration has been rejected. Please contact the registrar's office for more information.
                      </AlertDescription>
                    </Alert>
                  )}

                  {registration.status === "APPROVED" && (
                    <Alert variant="default" className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Registration Approved</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your registration has been approved. You can now print your registration card.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-2">Registered Courses</h3>
                    <div className="space-y-4">
                      {!registration.courseUploads || registration.courseUploads.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No courses registered</p>
                        </div>
                      ) : (
                        registration.courseUploads.map((upload) => (
                          <div key={upload.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div>
                              <p className="font-medium">
                                {upload.course.code}: {upload.course.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {upload.course.creditHours} Credit Hours • {upload.course.department.name}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                upload.status === "APPROVED"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : upload.status === "REJECTED"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }
                            >
                              {upload.status}
                            </Badge>
                          </div>
                        ))
                      )}

                      <div className="flex justify-between items-center p-4 border-t">
                        <div>
                          <p className="font-medium">Total Credit Hours</p>
                          <p className="text-sm text-muted-foreground">Total credits for this semester</p>
                        </div>
                        <p className="text-xl font-bold">{totalCreditHours}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Registration Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Registration Created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(registration.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {registration.status !== "DRAFT" && (
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">Registration Submitted</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(registration.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {registration.status === "APPROVED" && (
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Registration Approved</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(registration.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {registration.status === "REJECTED" && (
                        <div className="flex items-start gap-3">
                          <div className="bg-red-100 p-2 rounded-full">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">Registration Rejected</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(registration.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              {registration.status === "APPROVED" && (
                <CardFooter>
                  <Button className="w-full" onClick={() => setShowPrintCard(true)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Registration Card
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {/* Drop Course Confirmation Dialog */}
          <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Course Drop</DialogTitle>
                <DialogDescription>
                  Are you sure you want to drop this course? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCourseToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDropCourse} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Dropping...
                    </>
                  ) : (
                    "Drop Course"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Registration Submission Confirmation Dialog */}
          <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registration Submitted</DialogTitle>
                <DialogDescription>
                  Your registration has been submitted successfully and is now pending approval.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  You will be notified once your registration is approved. You can check the status of your registration
                  on this page.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowConfirmation(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Print Registration Card Dialog */}
          <Dialog open={showPrintCard} onOpenChange={setShowPrintCard} className="max-w-4xl">
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registration Card</DialogTitle>
                <DialogDescription>
                  Print or download your registration card for {registration.semester.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <PrintRegistrationCard registration={registration} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPrintCard(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
