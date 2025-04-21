"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RegistrationStatus } from "@/components/dashboard/registration-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PlusCircle, Trash2, Printer } from "lucide-react"
import { getActiveSemester } from "@/lib/actions/semester-actions"
import { getStudentRegistration, registerForSemester } from "@/lib/actions/registration-actions"
import {
  getAvailableCoursesForSemester,
  getStudentRegisteredCourses,
  addCourseToRegistration,
  dropCourseFromRegistration,
} from "@/lib/actions/course-registration-actions"
import { getRegistrationCard } from "@/lib/actions/registration-actions"
import { PrintRegistrationCard } from "@/components/dashboard/print-registration-card"

export default function RegistrationPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isDroppingCourse, setIsDroppingCourse] = useState(false)
  const [activeSemester, setActiveSemester] = useState<any>(null)
  const [registration, setRegistration] = useState<any>(null)
  const [registrationCard, setRegistrationCard] = useState<any>(null)
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)

        // Get active semester
        const semesterResult = await getActiveSemester()
        if (semesterResult.success) {
          setActiveSemester(semesterResult.semester)

          // Get student registration for this semester
          const registrationResult = await getStudentRegistration(session.user.id, semesterResult.semester.id)
          if (registrationResult.success) {
            setRegistration(registrationResult.registration)

            // Get registration card if available
            const cardResult = await getRegistrationCard(session.user.id, semesterResult.semester.id)
            if (cardResult.success) {
              setRegistrationCard(cardResult.registrationCard)
            }

            // Get registered courses
            const coursesResult = await getStudentRegisteredCourses(session.user.id, semesterResult.semester.id)
            if (coursesResult.success) {
              setRegisteredCourses(coursesResult.courseUploads)
            }
          }

          // Get available courses for this semester
          const availableCoursesResult = await getAvailableCoursesForSemester(semesterResult.semester.id)
          if (availableCoursesResult.success) {
            setAvailableCourses(availableCoursesResult.courses)
          }
        } else {
          toast({
            title: "No Active Semester",
            description: "There is no active semester at the moment.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching registration data:", error)
        toast({
          title: "Error",
          description: "Failed to load registration data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, toast])

  const handleRegisterForSemester = async () => {
    if (!session?.user?.id || !activeSemester?.id) return

    setIsRegistering(true)
    try {
      const result = await registerForSemester(session.user.id, activeSemester.id)
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "You have successfully registered for the semester.",
        })
        setRegistration(result.registration)
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Failed to register for the semester. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error registering for semester:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleAddCourse = async () => {
    if (!session?.user?.id || !activeSemester?.id || !registration?.id || selectedCourses.length === 0) return

    setIsAddingCourse(true)
    try {
      // Add each selected course
      for (const courseId of selectedCourses) {
        const result = await addCourseToRegistration(session.user.id, activeSemester.id, registration.id, courseId)

        if (!result.success) {
          toast({
            title: "Error Adding Course",
            description: result.message || "Failed to add course. Please try again.",
            variant: "destructive",
          })
        }
      }

      // Refresh registered courses
      const coursesResult = await getStudentRegisteredCourses(session.user.id, activeSemester.id)
      if (coursesResult.success) {
        setRegisteredCourses(coursesResult.courseUploads)
        toast({
          title: "Courses Added",
          description: "Selected courses have been added to your registration.",
        })
      }

      // Clear selection and close dialog
      setSelectedCourses([])
      setShowAddCourseDialog(false)
    } catch (error) {
      console.error("Error adding courses:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingCourse(false)
    }
  }

  const handleDropCourse = async () => {
    if (!courseToDelete) return

    setIsDroppingCourse(true)
    try {
      const result = await dropCourseFromRegistration(courseToDelete)
      if (result.success) {
        toast({
          title: "Course Dropped",
          description: "The course has been removed from your registration.",
        })

        // Update local state
        setRegisteredCourses(registeredCourses.filter((course) => course.id !== courseToDelete))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to drop course. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error dropping course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDroppingCourse(false)
      setCourseToDelete(null)
    }
  }

  // Filter out courses that are already registered
  const filteredAvailableCourses = availableCourses.filter(
    (course) => !registeredCourses.some((rc) => rc.course.id === course.id),
  )

  if (showPrintView && registrationCard && registeredCourses.length > 0) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Registration Card" text="Print your registration card.">
          <Button variant="outline" onClick={() => setShowPrintView(false)}>
            Back to Registration
          </Button>
        </DashboardHeader>

        <PrintRegistrationCard registrationCard={registrationCard} courses={registeredCourses} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Registration" text="Register for the current semester.">
        {registrationCard && (
          <Button variant="outline" onClick={() => setShowPrintView(true)} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Registration Card
          </Button>
        )}
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-8">
          {activeSemester ? (
            <>
              {registration ? (
                <RegistrationStatus registration={registration} registrationCard={registrationCard} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Semester Registration</CardTitle>
                    <CardDescription>
                      You are not registered for the current semester ({activeSemester.name}).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Registration is required to enroll in courses for the semester. Click the button below to
                      register.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleRegisterForSemester} disabled={isRegistering}>
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
              )}

              {registration && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Course Registration</CardTitle>
                      <CardDescription>Manage your course registrations for {activeSemester.name}.</CardDescription>
                    </div>
                    {registration.status !== "REJECTED" && (
                      <Button onClick={() => setShowAddCourseDialog(true)} className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Course
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registeredCourses.length > 0 ? (
                          registeredCourses.map((courseUpload) => (
                            <TableRow key={courseUpload.id}>
                              <TableCell className="font-medium">{courseUpload.course.code}</TableCell>
                              <TableCell>{courseUpload.course.title}</TableCell>
                              <TableCell>{courseUpload.course.department.name}</TableCell>
                              <TableCell>{courseUpload.course.credits}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    courseUpload.status === "APPROVED"
                                      ? "success"
                                      : courseUpload.status === "REJECTED"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {courseUpload.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {courseUpload.status === "PENDING" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCourseToDelete(courseUpload.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                              No courses registered. Click "Add Course" to register for courses.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No Active Semester</h3>
                  <p className="text-muted-foreground mt-2">
                    There is no active semester at the moment. Please check back later.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Courses</DialogTitle>
            <DialogDescription>
              Select the courses you want to add to your registration for {activeSemester?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {filteredAvailableCourses.length > 0 ? (
              <div className="space-y-4">
                {filteredAvailableCourses.map((course) => (
                  <div key={course.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCourses([...selectedCourses, course.id])
                        } else {
                          setSelectedCourses(selectedCourses.filter((id) => id !== course.id))
                        }
                      }}
                    />
                    <div className="space-y-1 leading-none">
                      <p className="text-base font-medium">
                        {course.code}: {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {course.credits} credits | {course.department.name}
                      </p>
                      {course.description && <p className="text-sm text-muted-foreground mt-1">{course.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                No additional courses available for registration.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCourse} disabled={isAddingCourse || selectedCourses.length === 0}>
              {isAddingCourse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drop Course Confirmation Dialog */}
      <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drop Course</DialogTitle>
            <DialogDescription>Are you sure you want to drop this course from your registration?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDropCourse} disabled={isDroppingCourse}>
              {isDroppingCourse ? (
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
    </DashboardShell>
  )
}
