"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { BookOpen, GraduationCap } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface Grade {
  id: string
  courseId: string
  courseCode: string
  courseTitle: string
  semester: string
  academicYear: string
  midtermGrade: number | null
  finalGrade: number | null
  assignments: {
    id: string
    title: string
    grade: number
    maxGrade: number
    weight: number
  }[]
  overallGrade: number | null
  letterGrade: string | null
}

export default function GradesPage() {
  const { data: session } = useSession()
  const [grades, setGrades] = useState<Grade[]>([])
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([])
  const [semesters, setSemesters] = useState<string[]>([])
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Grade | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchGrades()
    }
  }, [session])

  useEffect(() => {
    if (grades.length > 0) {
      // Extract unique semesters and academic years
      const uniqueSemesters = [...new Set(grades.map((grade) => grade.semester))]
      const uniqueYears = [...new Set(grades.map((grade) => grade.academicYear))]

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
  }, [grades, selectedSemester, selectedYear])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/students/grades?studentId=${session.user.id}`)
      const data = await res.json()
      setGrades(data.grades)
    } catch (error) {
      console.error("Error fetching grades:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your grades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...grades]

    if (selectedSemester && selectedSemester !== "all") {
      filtered = filtered.filter((grade) => grade.semester === selectedSemester)
    }

    if (selectedYear && selectedYear !== "all") {
      filtered = filtered.filter((grade) => grade.academicYear === selectedYear)
    }

    setFilteredGrades(filtered)
  }

  const calculateGPA = (grades: Grade[]): number => {
    const validGrades = grades.filter((grade) => grade.letterGrade !== null)

    if (validGrades.length === 0) return 0

    const gradePoints = validGrades.reduce((total, grade) => {
      let points = 0

      switch (grade.letterGrade) {
        case "A+":
          points = 4.0
          break
        case "A":
          points = 4.0
          break
        case "A-":
          points = 3.7
          break
        case "B+":
          points = 3.3
          break
        case "B":
          points = 3.0
          break
        case "B-":
          points = 2.7
          break
        case "C+":
          points = 2.3
          break
        case "C":
          points = 2.0
          break
        case "C-":
          points = 1.7
          break
        case "D+":
          points = 1.3
          break
        case "D":
          points = 1.0
          break
        case "F":
          points = 0.0
          break
        default:
          points = 0.0
      }

      return total + points
    }, 0)

    return Number.parseFloat((gradePoints / validGrades.length).toFixed(2))
  }

  const getGradeColor = (grade: number | null): string => {
    if (grade === null) return "text-gray-400"
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    if (grade >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getLetterGradeColor = (letterGrade: string | null): string => {
    if (!letterGrade) return "text-gray-400"
    if (letterGrade.startsWith("A")) return "text-green-600"
    if (letterGrade.startsWith("B")) return "text-blue-600"
    if (letterGrade.startsWith("C")) return "text-yellow-600"
    if (letterGrade.startsWith("D")) return "text-orange-600"
    return "text-red-600"
  }

  // Sample data for the chart
  const gradeProgressData = [
    { name: "Semester 1", gpa: 3.5 },
    { name: "Semester 2", gpa: 3.7 },
    { name: "Semester 3", gpa: 3.2 },
    { name: "Semester 4", gpa: 3.8 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">My Grades</h1>
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
              <p className="text-3xl font-bold">{calculateGPA(filteredGrades)}</p>
            </div>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Courses Completed</p>
              <p className="text-3xl font-bold">
                {filteredGrades.filter((grade) => grade.overallGrade !== null).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Courses In Progress</p>
              <p className="text-3xl font-bold">
                {filteredGrades.filter((grade) => grade.overallGrade === null).length}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grades" onValueChange={() => setSelectedCourse(null)}>
        <TabsList>
          <TabsTrigger value="grades">Course Grades</TabsTrigger>
          <TabsTrigger value="details">Grade Details</TabsTrigger>
          <TabsTrigger value="progress">GPA Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Grades</CardTitle>
              <CardDescription>
                Your grades for {selectedSemester && selectedSemester !== "all" ? selectedSemester : "all semesters"}
                {selectedYear && selectedYear !== "all" ? `, ${selectedYear}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading grades...</p>
                </div>
              ) : filteredGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Midterm</TableHead>
                        <TableHead>Final</TableHead>
                        <TableHead>Overall</TableHead>
                        <TableHead>Letter Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.map((grade) => (
                        <TableRow
                          key={grade.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedCourse(grade)}
                        >
                          <TableCell className="font-medium">
                            {grade.courseCode}: {grade.courseTitle}
                          </TableCell>
                          <TableCell>
                            {grade.semester}, {grade.academicYear}
                          </TableCell>
                          <TableCell className={getGradeColor(grade.midtermGrade)}>
                            {grade.midtermGrade !== null ? grade.midtermGrade : "N/A"}
                          </TableCell>
                          <TableCell className={getGradeColor(grade.finalGrade)}>
                            {grade.finalGrade !== null ? grade.finalGrade : "N/A"}
                          </TableCell>
                          <TableCell className={getGradeColor(grade.overallGrade)}>
                            {grade.overallGrade !== null ? grade.overallGrade : "In Progress"}
                          </TableCell>
                          <TableCell className={getLetterGradeColor(grade.letterGrade)}>
                            {grade.letterGrade || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No grades found for the selected filters.</p>
                  <p className="text-sm text-muted-foreground">Try selecting a different semester or academic year.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Details</CardTitle>
              <CardDescription>
                {selectedCourse
                  ? `Detailed breakdown for ${selectedCourse.courseCode}: ${selectedCourse.courseTitle}`
                  : "Select a course from the Course Grades tab to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCourse ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No course selected.</p>
                  <p className="text-sm text-muted-foreground">
                    Select a course from the Course Grades tab to view detailed grade information.
                  </p>
                </div>
              ) : selectedCourse.assignments.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Midterm Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(selectedCourse.midtermGrade)}`}>
                        {selectedCourse.midtermGrade !== null ? selectedCourse.midtermGrade : "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Final Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(selectedCourse.finalGrade)}`}>
                        {selectedCourse.finalGrade !== null ? selectedCourse.finalGrade : "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Overall Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(selectedCourse.overallGrade)}`}>
                        {selectedCourse.overallGrade !== null ? selectedCourse.overallGrade : "In Progress"}
                        {selectedCourse.letterGrade && ` (${selectedCourse.letterGrade})`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Assignments</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Assignment</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Contribution</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCourse.assignments.map((assignment) => {
                            const percentage = (assignment.grade / assignment.maxGrade) * 100
                            const contribution = (percentage * assignment.weight) / 100

                            return (
                              <TableRow key={assignment.id}>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell className={getGradeColor(percentage)}>
                                  {assignment.grade}/{assignment.maxGrade} ({percentage.toFixed(1)}%)
                                </TableCell>
                                <TableCell>{assignment.weight}%</TableCell>
                                <TableCell>{contribution.toFixed(2)} points</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assignment details available for this course.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPA Progress</CardTitle>
              <CardDescription>Your GPA trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeProgressData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="gpa" name="GPA" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

