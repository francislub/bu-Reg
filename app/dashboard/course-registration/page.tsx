"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, BookOpen, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  department: string
  semester: string
  academicYear: string
  maxCapacity: number
  currentEnrolled: number
  prerequisites: string[]
  faculty: {
    id: string
    name: string
  } | null
}

interface Registration {
  id: string
  courseId: string
  status: string
  registeredAt: string
}

export default function CourseRegistrationPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [department, setDepartment] = useState("")
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [currentSemester, setCurrentSemester] = useState("Fall 2023")
  const [currentAcademicYear, setCurrentAcademicYear] = useState("2023-2024")
  const [maxCoursesAllowed, setMaxCoursesAllowed] = useState(6)
  const [registrationDeadline, setRegistrationDeadline] = useState("2023-09-15")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCourses()
    fetchRegistrations()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (courses.length > 0) {
      applyFilters()
    }
  }, [courses, searchTerm, department])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/courses?semester=${currentSemester}&academicYear=${currentAcademicYear}`)
      const data = await res.json()
      setCourses(data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      useToast({
        title: "Error",
        description: "Failed to fetch available courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    try {
      if (!session?.user?.id) return

      const res = await fetch(
        `/api/registrations?studentId=${session.user.id}&semester=${currentSemester}&academicYear=${currentAcademicYear}`,
      )
      const data = await res.json()
      setRegistrations(data.registrations)
    } catch (error) {
      console.error("Error fetching registrations:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()

      if (data.registration) {
        setMaxCoursesAllowed(data.registration.maxCoursesPerStudent || 6)
        setRegistrationDeadline(data.registration.registrationEndDate || "2023-09-15")
      }

      if (data.academic) {
        setCurrentSemester(data.academic.currentSemester || "Fall 2023")
        setCurrentAcademicYear(data.academic.currentAcademicYear || "2023-2024")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...courses]

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (department) {
      filtered = filtered.filter((course) => course.department === department)
    }

    setFilteredCourses(filtered)
  }

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      } else {
        if (prev.length >= maxCoursesAllowed) {
          useToast({
            title: "Maximum courses reached",
            description: `You can only register for up to ${maxCoursesAllowed} courses per semester.`,
            variant: "destructive",
          })
          return prev
        }
        return [...prev, courseId]
      }
    })
  }

  const checkPrerequisites = (course: Course): boolean => {
    // In a real app, you would check if the student has completed the prerequisites
    // For now, we'll just return true
    return true
  }

  const isRegistered = (courseId: string): boolean => {
    return registrations.some((reg) => reg.courseId === courseId)
  }

  const getRegistrationStatus = (courseId: string): string | null => {
    const registration = registrations.find((reg) => reg.courseId === courseId)
    return registration ? registration.status : null
  }

  const handleRegister = async () => {
    try {
      if (!session?.user?.id) {
        useToast({
          title: "Authentication required",
          description: "Please log in to register for courses",
          variant: "destructive",
        })
        return
      }

      if (selectedCourses.length === 0) {
        useToast({
          title: "No courses selected",
          description: "Please select at least one course to register",
          variant: "destructive",
        })
        return
      }

      setRegistering(true)
      setError("")

      // Check if registration deadline has passed
      const now = new Date()
      const deadline = new Date(registrationDeadline)
      if (now > deadline) {
        setError("Registration deadline has passed. Please contact the administration.")
        setRegistering(false)
        return
      }

      // Register for each selected course
      const registrationPromises = selectedCourses.map((courseId) => {
        return fetch("/api/registrations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: session.user.id,
            courseId,
            semester: currentSemester,
            academicYear: currentAcademicYear,
          }),
        }).then((res) => {
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.error || "Failed to register for course")
            })
          }
          return res.json()
        })
      })

      await Promise.all(registrationPromises)

      useToast({
        title: "Registration successful",
        description: "Your course registrations have been submitted for approval",
      })

      // Refresh registrations
      fetchRegistrations()
      setSelectedCourses([])

      // Generate registration slip
      router.push("/dashboard/registration-history")
    } catch (error) {
      console.error("Error registering for courses:", error)
      setError(error.message || "Failed to register for courses")
      useToast({
        title: "Registration failed",
        description: error.message || "Failed to register for courses",
        variant: "destructive",
      })
    } finally {
      setRegistering(false)
    }
  }

  const departments = ["Computer Science", "Electrical Engineering", "Business Administration", "Medicine", "Physics"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Course Registration</h1>
        <div className="text-sm text-muted-foreground">
          <p>
            Current Semester: <span className="font-medium">{currentSemester}</span>
          </p>
          <p>
            Registration Deadline:{" "}
            <span className="font-medium">{new Date(registrationDeadline).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="registered">My Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses by code or title..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-64">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>
                Select courses to register for the {currentSemester} semester. You can register for up to{" "}
                {maxCoursesAllowed} courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading courses...</p>
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => {
                        const isAlreadyRegistered = isRegistered(course.id)
                        const registrationStatus = getRegistrationStatus(course.id)
                        const isFull = course.currentEnrolled >= course.maxCapacity
                        const hasPrerequisites = checkPrerequisites(course)

                        return (
                          <TableRow key={course.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => handleSelectCourse(course.id)}
                                disabled={isAlreadyRegistered || isFull || !hasPrerequisites}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{course.code}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.department}</TableCell>
                            <TableCell>{course.faculty?.name || "TBA"}</TableCell>
                            <TableCell>
                              <Badge variant={isFull ? "destructive" : "outline"}>
                                {course.currentEnrolled}/{course.maxCapacity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isAlreadyRegistered ? (
                                <Badge
                                  variant={
                                    registrationStatus === "APPROVED"
                                      ? "success"
                                      : registrationStatus === "REJECTED"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {registrationStatus}
                                </Badge>
                              ) : isFull ? (
                                <Badge variant="destructive">Full</Badge>
                              ) : !hasPrerequisites ? (
                                <Badge variant="destructive">Prerequisites not met</Badge>
                              ) : (
                                <Badge variant="outline">Available</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No courses found matching your criteria.</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Selected: {selectedCourses.length}/{maxCoursesAllowed} courses
              </div>
              <Button onClick={handleRegister} disabled={selectedCourses.length === 0 || registering}>
                {registering ? "Registering..." : "Register Selected Courses"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="registered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Registrations</CardTitle>
              <CardDescription>Your current course registrations for the {currentSemester} semester.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading registrations...</p>
                </div>
              ) : registrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Registered On</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => {
                        const course = courses.find((c) => c.id === registration.courseId)
                        if (!course) return null

                        return (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">{course.code}</TableCell>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.faculty?.name || "TBA"}</TableCell>
                            <TableCell>{new Date(registration.registeredAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  registration.status === "APPROVED"
                                    ? "success"
                                    : registration.status === "REJECTED"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {registration.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't registered for any courses yet.</p>
                  <p className="text-sm text-muted-foreground">Go to the Available Courses tab to register.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

