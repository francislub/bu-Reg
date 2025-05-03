"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  description?: string
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

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Registration</CardTitle>
          <CardDescription>Select a semester and courses to register for</CardDescription>
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
                <div>
                  <h3 className="mb-3 font-medium">Available Courses</h3>
                  <Separator className="mb-4" />

                  {loading ? (
                    <div className="flex justify-center p-4">
                      <p>Loading courses...</p>
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="rounded-md border p-4 text-center">
                      <p className="text-muted-foreground">No courses available for this semester</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {availableCourses.map((course) => (
                          <div key={course.id} className="flex items-start space-x-3 rounded-md border p-3">
                            <Checkbox
                              id={`course-${course.id}`}
                              checked={selectedCourses.includes(course.id)}
                              onCheckedChange={() => handleCourseToggle(course.id)}
                              disabled={
                                submitting ||
                                existingRegistration?.status === "APPROVED" ||
                                existingRegistration?.status === "REJECTED"
                              }
                            />
                            <div className="grid gap-1">
                              <Label htmlFor={`course-${course.id}`} className="font-medium">
                                {course.code} - {course.title}
                              </Label>
                              <p className="text-sm text-muted-foreground">{course.credits} credits</p>
                              {course.description && (
                                <p className="text-sm text-muted-foreground">{course.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
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
              existingRegistration?.status === "APPROVED" ||
              existingRegistration?.status === "REJECTED"
            }
          >
            {submitting ? "Submitting..." : existingRegistration ? "Update Registration" : "Submit Registration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
