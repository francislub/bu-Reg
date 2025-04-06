"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Calendar, Clock, FileText, GraduationCap, User } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  description: string
  department: string
  semester: string
  academicYear: string
  faculty: {
    id: string
    name: string
    email: string
  } | null
  registrationId: string
  registrationStatus: string
}

export default function MyCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<string[]>([])
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyCourses()
    }
  }, [session])

  useEffect(() => {
    if (courses.length > 0) {
      // Extract unique semesters and academic years
      const uniqueSemesters = [...new Set(courses.map((course) => course.semester))]
      const uniqueYears = [...new Set(courses.map((course) => course.academicYear))]

      setSemesters(uniqueSemesters)
      setAcademicYears(uniqueYears)

      // Set default filters to the most recent semester and year
      if (!selectedSemester && uniqueSemesters.length > 0) {
        setSelectedSemester(uniqueSemesters[0])
      }

      if (!selectedYear && uniqueYears.length > 0) {
        setSelectedYear(uniqueYears[0])
      }

      applyFilters()
    }
  }, [courses, selectedSemester, selectedYear])

  const fetchMyCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/students/courses?studentId=${session.user.id}`)
      const data = await res.json()

      // Transform the data to include registration info
      const coursesWithRegistration = data.courses.map((course) => ({
        ...course,
        registrationId: course.registration.id,
        registrationStatus: course.registration.status,
      }))

      setCourses(coursesWithRegistration)
    } catch (error) {
      console.error("Error fetching courses:", error)
      useToast({
        title: "Error",
        description: "Failed to fetch your courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...courses]

    if (selectedSemester) {
      filtered = filtered.filter((course) => course.semester === selectedSemester)
    }

    if (selectedYear) {
      filtered = filtered.filter((course) => course.academicYear === selectedYear)
    }

    setFilteredCourses(filtered)
  }

  const calculateTotalCredits = () => {
    return filteredCourses
      .filter((course) => course.registrationStatus === "APPROVED")
      .reduce((total, course) => total + course.credits, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
              <p className="text-3xl font-bold">
                {filteredCourses.filter((c) => c.registrationStatus === "APPROVED").length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
              <p className="text-3xl font-bold">{calculateTotalCredits()}</p>
            </div>
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
              <p className="text-3xl font-bold">{selectedSemester || "All"}</p>
            </div>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Courses</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading your courses...</p>
            </div>
          ) : filteredCourses.filter((c) => c.registrationStatus === "APPROVED").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses
                .filter((course) => course.registrationStatus === "APPROVED")
                .map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{course.code}</CardTitle>
                        <Badge>{course.credits} Credits</Badge>
                      </div>
                      <CardDescription>{course.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {course.semester}, {course.academicYear}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Instructor: {course.faculty?.name || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Department: {course.department}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/dashboard/courses/${course.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Course Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don't have any approved courses for this semester.</p>
              <Link href="/dashboard/course-registration">
                <Button variant="link" className="mt-2">
                  Register for Courses
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading pending approvals...</p>
            </div>
          ) : filteredCourses.filter((c) => c.registrationStatus === "PENDING").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses
                .filter((course) => course.registrationStatus === "PENDING")
                .map((course) => (
                  <Card key={course.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{course.code}</CardTitle>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                      <CardDescription>{course.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {course.semester}, {course.academicYear}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Instructor: {course.faculty?.name || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Awaiting faculty approval</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don't have any pending course approvals.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

