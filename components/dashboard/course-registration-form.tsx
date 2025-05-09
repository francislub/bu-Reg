"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function CourseRegistrationForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [semesters, setSemesters] = useState<any[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("")
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([])
  const [totalCredits, setTotalCredits] = useState(0)
  const MAX_CREDITS = 24

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/users/${session.user.id}`)
        if (!response.ok) throw new Error("Failed to fetch user profile")

        const data = await response.json()
        setUserProfile(data.user)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      }
    }

    const fetchSemesters = async () => {
      try {
        const response = await fetch("/api/semesters?active=true")
        if (!response.ok) throw new Error("Failed to fetch semesters")

        const data = await response.json()
        setSemesters(data.semesters || [])

        // If there's only one active semester, auto-select it
        if (data.semesters && data.semesters.length === 1) {
          setSelectedSemesterId(data.semesters[0].id)
        }
      } catch (error) {
        console.error("Error fetching semesters:", error)
        toast({
          title: "Error",
          description: "Failed to load active semesters. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    Promise.all([fetchUserProfile(), fetchSemesters()])
  }, [session, toast])

  useEffect(() => {
    if (!selectedSemesterId || !userProfile?.profile?.programId || !userProfile?.profile?.departmentId) return

    const fetchAvailableCourses = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/courses/by-program-department?programId=${userProfile.profile.programId}&departmentId=${userProfile.profile.departmentId}`,
        )
        if (!response.ok) throw new Error("Failed to fetch courses")

        const data = await response.json()
        setAvailableCourses(data.courses || [])
      } catch (error) {
        console.error("Error fetching available courses:", error)
        toast({
          title: "Error",
          description: "Failed to load available courses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchRegisteredCourses = async () => {
      try {
        const response = await fetch(`/api/course-uploads?userId=${session?.user?.id}&semesterId=${selectedSemesterId}`)
        if (!response.ok) throw new Error("Failed to fetch registered courses")

        const data = await response.json()
        setRegisteredCourses(data.courseUploads || [])

        // Pre-select courses that are already registered
        const registeredCourseIds = data.courseUploads.map((cu: any) => cu.courseId)
        setSelectedCourses(registeredCourseIds)
      } catch (error) {
        console.error("Error fetching registered courses:", error)
        toast({
          title: "Error",
          description: "Failed to load your registered courses. Please try again.",
          variant: "destructive",
        })
      }
    }

    Promise.all([fetchAvailableCourses(), fetchRegisteredCourses()])
  }, [selectedSemesterId, userProfile, session, toast])

  // Calculate total credits whenever selected courses change
  useEffect(() => {
    const credits = availableCourses
      .filter((course) => selectedCourses.includes(course.id))
      .reduce((total, course) => total + course.credits, 0)

    setTotalCredits(credits)
  }, [selectedCourses, availableCourses])

  const handleCourseToggle = (courseId: string, credits: number) => {
    setSelectedCourses((prev) => {
      // If course is already selected, remove it
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      }

      // If adding this course would exceed the credit limit, show warning and don't add
      const currentCredits = availableCourses
        .filter((course) => prev.includes(course.id))
        .reduce((total, course) => total + course.credits, 0)

      if (currentCredits + credits > MAX_CREDITS) {
        toast({
          title: "Credit Limit Exceeded",
          description: `Adding this course would exceed the maximum of ${MAX_CREDITS} credits.`,
          variant: "destructive",
        })
        return prev
      }

      // Otherwise, add the course
      return [...prev, courseId]
    })
  }

  const handleSubmit = async () => {
    if (!session?.user?.id || !selectedSemesterId) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (selectedCourses.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one course to register.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // First, create or get the registration
      const registrationResponse = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          semesterId: selectedSemesterId,
        }),
      })

      if (!registrationResponse.ok) {
        throw new Error("Failed to create registration")
      }

      const registrationData = await registrationResponse.json()
      const registrationId = registrationData.registration.id

      // Then, register each selected course
      for (const courseId of selectedCourses) {
        // Check if course is already registered
        const isAlreadyRegistered = registeredCourses.some(
          (rc) => rc.courseId === courseId && rc.semesterId === selectedSemesterId,
        )

        if (!isAlreadyRegistered) {
          const courseResponse = await fetch("/api/course-uploads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              registrationId,
              courseId,
              userId: session.user.id,
              semesterId: selectedSemesterId,
            }),
          })

          if (!courseResponse.ok) {
            throw new Error(`Failed to register course ${courseId}`)
          }
        }
      }

      // Handle course drops - remove courses that were previously registered but now unselected
      for (const registeredCourse of registeredCourses) {
        if (!selectedCourses.includes(registeredCourse.courseId)) {
          const dropResponse = await fetch(`/api/course-uploads/${registeredCourse.id}`, {
            method: "DELETE",
          })

          if (!dropResponse.ok) {
            throw new Error(`Failed to drop course ${registeredCourse.courseId}`)
          }
        }
      }

      toast({
        title: "Success",
        description: "Course registration submitted successfully.",
      })

      router.push("/dashboard/registration")
      router.refresh()
    } catch (error) {
      console.error("Error submitting course registration:", error)
      toast({
        title: "Error",
        description: "Failed to submit course registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session || session.user.role !== "STUDENT") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Only students can register for courses.</p>
        </CardContent>
      </Card>
    )
  }

  // Check if program and department are selected
  if (userProfile && (!userProfile.profile?.programId || !userProfile.profile?.departmentId)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Program Selection Required</AlertTitle>
            <AlertDescription>
              You need to select your program and department before registering for courses.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/dashboard/program-selection")} className="w-full">
            Select Program and Department
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Registration</CardTitle>
        <CardDescription>
          Select the courses you want to register for this semester. Maximum {MAX_CREDITS} credits allowed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={selectedSemesterId}
                onValueChange={setSelectedSemesterId}
                disabled={isSubmitting || semesters.length === 0}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.length > 0 ? (
                    semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} ({semester.academicYear.name})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No active semesters available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedSemesterId && (
              <>
                <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                  <div>
                    <span className="font-medium">Selected Credits: </span>
                    <span className={totalCredits > MAX_CREDITS ? "text-red-500 font-bold" : "font-bold"}>
                      {totalCredits} / {MAX_CREDITS}
                    </span>
                  </div>
                  {totalCredits > MAX_CREDITS ? (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Credit limit exceeded
                    </Badge>
                  ) : totalCredits === 0 ? (
                    <Badge variant="outline" className="flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      No courses selected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Within credit limit
                    </Badge>
                  )}
                </div>

                {availableCourses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableCourses.map((course) => {
                        const registeredCourse = registeredCourses.find((rc) => rc.courseId === course.id)
                        return (
                          <TableRow key={course.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => handleCourseToggle(course.id, course.credits)}
                                disabled={
                                  isSubmitting ||
                                  registeredCourse?.status === "APPROVED" ||
                                  registeredCourse?.status === "REJECTED"
                                }
                              />
                            </TableCell>
                            <TableCell>{course.code}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.department.name}</TableCell>
                            <TableCell>
                              {registeredCourse ? (
                                registeredCourse.status === "APPROVED" ? (
                                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                                ) : registeredCourse.status === "REJECTED" ? (
                                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                )
                              ) : (
                                <Badge variant="outline">Not Registered</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No courses available for your program and department.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedSemesterId || selectedCourses.length === 0 || totalCredits > MAX_CREDITS}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Course Registration
        </Button>
      </CardFooter>
    </Card>
  )
}
