"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Calendar, FileText, Search, Users } from "lucide-react"
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
  enrolledStudents: number
  maxCapacity: number
  schedule: string
  location: string
}

export default function FacultyCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<string[]>([])
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCourses()
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
  }, [courses, selectedSemester, selectedYear, searchTerm])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/faculty/courses?facultyId=${session.user.id}`)
      const data = await res.json()
      setCourses(data.courses)
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

    if (selectedSemester && selectedSemester !== "all") {
      filtered = filtered.filter((course) => course.semester === selectedSemester)
    }

    if (selectedYear && selectedYear !== "all") {
      filtered = filtered.filter((course) => course.academicYear === selectedYear)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredCourses(filtered)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
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
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Enrollment: {course.enrolledStudents}/{course.maxCapacity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Department: {course.department}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/faculty/courses/${course.id}`} className="w-full">
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
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{course.code}</h3>
                          <Badge>{course.credits} Credits</Badge>
                        </div>
                        <p>{course.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {course.semester}, {course.academicYear}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolledStudents}/{course.maxCapacity} students
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {course.department}
                          </span>
                        </div>
                      </div>
                      <Link href={`/faculty/courses/${course.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

