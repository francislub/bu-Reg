"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, PlusCircle, Trash2 } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { registerForSemester } from "@/lib/actions/registration-actions"
import { addCourseToRegistration, removeCourseFromRegistration } from "@/lib/actions/course-registration-actions"

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
  name: string
  creditHours: number
  description?: string
  departmentId: string
}

type CourseUpload = {
  id: string
  courseId: string
  registrationId: string
  status: string
  course: Course
}

type Registration = {
  id: string
  userId: string
  semesterId: string
  status: string
  semester: Semester
  courseUploads?: CourseUpload[]
}

export default function RegistrationForm({
  semesters,
  courses,
  existingRegistration,
}: {
  semesters: Semester[]
  courses: Course[]
  existingRegistration?: Registration
}) {
  const router = useRouter()
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("")
  const [registration, setRegistration] = useState<Registration | null>(existingRegistration || null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Calculate total credit hours
  const totalCreditHours =
    registration?.courseUploads?.reduce((total, courseUpload) => total + courseUpload.course.creditHours, 0) || 0

  // Credit hour limit
  const CREDIT_HOUR_LIMIT = 24
  const creditHourPercentage = (totalCreditHours / CREDIT_HOUR_LIMIT) * 100

  useEffect(() => {
    if (existingRegistration) {
      setRegistration(existingRegistration)
      setSelectedSemesterId(existingRegistration.semesterId)
    }
  }, [existingRegistration])

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
      const result = await registerForSemester(selectedSemesterId)
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
    const courseToAdd = courses.find((c) => c.id === courseId)
    if (courseToAdd && totalCreditHours + courseToAdd.creditHours > CREDIT_HOUR_LIMIT) {
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
      default:
        return <Badge variant="outline">Pending</Badge>
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
                <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} ({semester.academicYear.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRegister} disabled={isRegistering}>
              {isRegistering ? "Registering..." : "Register for Semester"}
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
                  </div>
                  {registration.status === "APPROVED" && (
                    <Button onClick={() => router.push(`/dashboard/registration/card?id=${registration.id}`)}>
                      Print Registration Card
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

                {registration.status === "PENDING" && (
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
              {registration.status === "PENDING" && creditHourPercentage < 100 && (
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
                      <Input
                        placeholder="Search courses by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div>
                                <p className="font-medium">
                                  {course.code}: {course.name}
                                </p>
                                <p className="text-sm text-muted-foreground">{course.creditHours} Credit Hours</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddCourse(course.id)}
                                disabled={
                                  isAddingCourse ||
                                  isCourseSelected(course.id) ||
                                  totalCreditHours + course.creditHours > CREDIT_HOUR_LIMIT
                                }
                              >
                                {isCourseSelected(course.id)
                                  ? "Added"
                                  : totalCreditHours + course.creditHours > CREDIT_HOUR_LIMIT
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
                <div className="space-y-4">
                  {registration.courseUploads.map((courseUpload) => (
                    <div key={courseUpload.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {courseUpload.course.code}: {courseUpload.course.name}
                          </p>
                          <StatusBadge status={courseUpload.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{courseUpload.course.creditHours} Credit Hours</p>
                      </div>
                      {registration.status === "PENDING" && (
                        <Button size="sm" variant="outline" onClick={() => handleRemoveCourse(courseUpload.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No courses added yet</p>
                  {registration.status === "PENDING" && (
                    <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                      <PlusCircle className="w-4 h-4 mr-2" /> Add Your First Course
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
