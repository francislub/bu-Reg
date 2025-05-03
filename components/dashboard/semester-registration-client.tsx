"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, BookOpen, CheckCircle2, Clock, Plus, Minus, AlertTriangle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  description?: string
  department?: {
    name: string
  }
}

interface Semester {
  id: string
  name: string
  academicYear: {
    name: string
  }
}

interface Registration {
  id: string
  status: string
  semester: {
    id: string
  }
  courseUploads: {
    id: string
    course: Course
    status: string
  }[]
}

interface SemesterRegistrationClientProps {
  semesters: Semester[]
  programId?: string
  userId: string
  existingRegistrations: Registration[]
}

// Maximum allowed credit units
const MAX_CREDITS = 24

export function SemesterRegistrationClient({
  semesters = [],
  programId,
  userId,
  existingRegistrations = [],
}: SemesterRegistrationClientProps) {
  const router = useRouter()
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingRegistration, setExistingRegistration] = useState<Registration | null>(null)
  const [currentTab, setCurrentTab] = useState<string>("add")
  const [totalCredits, setTotalCredits] = useState<number>(0)

  // Check if user already has a registration for the selected semester
  useEffect(() => {
    if (selectedSemester) {
      const existing = existingRegistrations.find((reg) => reg.semester.id === selectedSemester)
      setExistingRegistration(existing || null)

      // If there's an existing registration, pre-select the courses
      if (existing) {
        setSelectedCourses(existing.courseUploads.map((cu) => cu.course.id))
      } else {
        setSelectedCourses([])
      }
    }
  }, [selectedSemester, existingRegistrations])

  // Fetch available courses when semester changes
  useEffect(() => {
    if (selectedSemester && programId) {
      setLoading(true)
      fetch(`/api/semesters/${selectedSemester}/courses?programId=${programId}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableCourses(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Failed to fetch courses:", error)
          toast({
            title: "Error",
            description: "Failed to load available courses. Please try again.",
            variant: "destructive",
          })
          setLoading(false)
        })
    } else {
      setAvailableCourses([])
    }
  }, [selectedSemester, programId])

  // Calculate total credits whenever selected courses change
  useEffect(() => {
    const calculateTotalCredits = () => {
      let total = 0

      selectedCourses.forEach((courseId) => {
        const course = availableCourses.find((c) => c.id === courseId)
        if (course) {
          total += course.credits
        }
      })

      setTotalCredits(total)
    }

    calculateTotalCredits()
  }, [selectedCourses, availableCourses])

  const handleAddCourse = (courseId: string) => {
    const courseToAdd = availableCourses.find((c) => c.id === courseId)

    if (courseToAdd) {
      const newTotalCredits = totalCredits + courseToAdd.credits

      // Check if adding this course would exceed credit limit
      if (newTotalCredits > MAX_CREDITS) {
        toast({
          title: "Credit Limit Exceeded",
          description: `Adding this course would exceed the maximum ${MAX_CREDITS} credit units allowed.`,
          variant: "destructive",
        })
        return
      }

      setSelectedCourses((prev) => [...prev, courseId])
    }
  }

  const handleDropCourse = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((id) => id !== courseId))
  }

  const handleSubmit = async () => {
    if (!selectedSemester) {
      toast({
        title: "Error",
        description: "Please select a semester",
        variant: "destructive",
      })
      return
    }

    if (selectedCourses.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one course",
        variant: "destructive",
      })
      return
    }

    // Final credit check before submission
    if (totalCredits > MAX_CREDITS) {
      toast({
        title: "Credit Limit Exceeded",
        description: `Your selected courses exceed the maximum ${MAX_CREDITS} credit units allowed.`,
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const endpoint = existingRegistration ? `/api/registrations/${existingRegistration.id}` : "/api/registrations"

      const method = existingRegistration ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          semesterId: selectedSemester,
          courseIds: selectedCourses,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit registration")
      }

      toast({
        title: "Success",
        description: existingRegistration
          ? "Your registration has been updated"
          : "Your registration has been submitted for approval",
      })

      router.refresh()
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        )
    }
  }

  const getCreditProgressColor = () => {
    if (totalCredits > MAX_CREDITS) return "bg-red-500"
    if (totalCredits > MAX_CREDITS * 0.8) return "bg-amber-500"
    return "bg-green-500"
  }

  const isReadOnly = existingRegistration?.status === "APPROVED" || existingRegistration?.status === "REJECTED"

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Registration</CardTitle>
          <CardDescription>Add and drop courses for the semester (Maximum: 24 credit units)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={submitting}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.academicYear.name} - {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {existingRegistration && (
              <div className="flex items-center justify-between rounded-md border p-4">
                <div className="flex flex-col gap-1">
                  <h4 className="font-medium">Registration Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Your registration for this semester is {existingRegistration.status.toLowerCase()}
                  </p>
                </div>
                {getStatusBadge(existingRegistration.status)}
              </div>
            )}

            {selectedSemester && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Credit Units</h3>
                    <span className={`text-sm font-medium ${totalCredits > MAX_CREDITS ? "text-red-500" : ""}`}>
                      {totalCredits} / {MAX_CREDITS} credits
                    </span>
                  </div>
                  <Progress value={(totalCredits / MAX_CREDITS) * 100} className={getCreditProgressColor()} />

                  {totalCredits > MAX_CREDITS && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Credit Limit Exceeded</AlertTitle>
                      <AlertDescription>
                        You have selected courses totaling {totalCredits} credit units, which exceeds the maximum of{" "}
                        {MAX_CREDITS}. Please drop some courses before submitting.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading courses...</span>
                  </div>
                ) : (
                  <>
                    {!isReadOnly && (
                      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="add">Add Courses</TabsTrigger>
                          <TabsTrigger value="drop">Drop Courses</TabsTrigger>
                        </TabsList>

                        <TabsContent value="add" className="mt-4">
                          <h3 className="mb-3 font-medium">Available Courses</h3>
                          <Separator className="mb-4" />

                          {availableCourses.length === 0 ? (
                            <div className="rounded-md border p-4 text-center">
                              <p className="text-muted-foreground">No courses available for this semester</p>
                            </div>
                          ) : (
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-4">
                                {availableCourses
                                  .filter((course) => !selectedCourses.includes(course.id))
                                  .map((course) => (
                                    <div key={course.id} className="flex items-start space-x-3 rounded-md border p-3">
                                      <div className="grid gap-1 flex-1">
                                        <div className="font-medium">
                                          {course.code} - {course.title}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <BookOpen className="mr-1 h-4 w-4" />
                                          {course.credits} credit unit{course.credits !== 1 ? "s" : ""}
                                        </div>
                                        {course.department && (
                                          <p className="text-sm text-muted-foreground">{course.department.name}</p>
                                        )}
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={() => handleAddCourse(course.id)}
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </ScrollArea>
                          )}
                        </TabsContent>

                        <TabsContent value="drop" className="mt-4">
                          <h3 className="mb-3 font-medium">Selected Courses</h3>
                          <Separator className="mb-4" />

                          {selectedCourses.length === 0 ? (
                            <div className="rounded-md border p-4 text-center">
                              <p className="text-muted-foreground">No courses selected yet</p>
                            </div>
                          ) : (
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-4">
                                {availableCourses
                                  .filter((course) => selectedCourses.includes(course.id))
                                  .map((course) => (
                                    <div key={course.id} className="flex items-start space-x-3 rounded-md border p-3">
                                      <div className="grid gap-1 flex-1">
                                        <div className="font-medium">
                                          {course.code} - {course.title}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <BookOpen className="mr-1 h-4 w-4" />
                                          {course.credits} credit unit{course.credits !== 1 ? "s" : ""}
                                        </div>
                                        {course.department && (
                                          <p className="text-sm text-muted-foreground">{course.department.name}</p>
                                        )}
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                                        onClick={() => handleDropCourse(course.id)}
                                      >
                                        <Minus className="h-4 w-4" />
                                        Drop
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </ScrollArea>
                          )}
                        </TabsContent>
                      </Tabs>
                    )}

                    {/* Read-only view for approved/rejected registrations */}
                    {isReadOnly && (
                      <div className="mt-4">
                        <h3 className="mb-3 font-medium">Registered Courses</h3>
                        <Separator className="mb-4" />

                        <ScrollArea className="h-[300px]">
                          <div className="space-y-4">
                            {availableCourses
                              .filter((course) => selectedCourses.includes(course.id))
                              .map((course) => (
                                <div key={course.id} className="flex items-start space-x-3 rounded-md border p-3">
                                  <div className="grid gap-1 flex-1">
                                    <div className="font-medium">
                                      {course.code} - {course.title}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <BookOpen className="mr-1 h-4 w-4" />
                                      {course.credits} credit unit{course.credits !== 1 ? "s" : ""}
                                    </div>
                                    {course.department && (
                                      <p className="text-sm text-muted-foreground">{course.department.name}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              selectedCourses.length === 0 ||
              !selectedSemester ||
              totalCredits > MAX_CREDITS ||
              isReadOnly
            }
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : existingRegistration ? (
              "Update Registration"
            ) : (
              "Submit Registration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
