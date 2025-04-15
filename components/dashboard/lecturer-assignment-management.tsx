"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/dashboard/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type Lecturer = {
  id: string
  name: string
  email: string
  department?: {
    name: string
  }
}

type Course = {
  id: string
  code: string
  title: string
  credits: number
  department: {
    name: string
  }
}

type Semester = {
  id: string
  name: string
  isActive: boolean
}

type LecturerCourse = {
  id: string
  lecturer: Lecturer
  course: Course
  semester: Semester
  createdAt: string
}

export function LecturerAssignmentManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [lecturerCourses, setLecturerCourses] = useState<LecturerCourse[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentLecturerCourse, setCurrentLecturerCourse] = useState<LecturerCourse | null>(null)
  const [formData, setFormData] = useState({
    lecturerId: "",
    courseId: "",
    semesterId: "",
  })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch semesters
        const semestersRes = await fetch("/api/semesters")
        const semestersData = await semestersRes.json()
        setSemesters(semestersData)

        // Set default selected semester to active semester
        const activeSemester = semestersData.find((s: Semester) => s.isActive)
        if (activeSemester) {
          setSelectedSemester(activeSemester.id)
          setFormData((prev) => ({ ...prev, semesterId: activeSemester.id }))
        }

        // Fetch lecturers
        const lecturersRes = await fetch("/api/users?role=STAFF")
        const lecturersData = await lecturersRes.json()
        setLecturers(lecturersData)

        // Fetch courses
        const coursesRes = await fetch("/api/courses")
        const coursesData = await coursesRes.json()
        setCourses(coursesData)

        // Fetch lecturer courses for active semester
        if (activeSemester) {
          const lecturerCoursesRes = await fetch(`/api/lecturer-courses?semesterId=${activeSemester.id}`)
          const lecturerCoursesData = await lecturerCoursesRes.json()
          setLecturerCourses(lecturerCoursesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSemesterChange = async (semesterId: string) => {
    setSelectedSemester(semesterId)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/lecturer-courses?semesterId=${semesterId}`)
      const data = await res.json()
      setLecturerCourses(data)
    } catch (error) {
      console.error("Error fetching lecturer courses:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load lecturer courses. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.lecturerId || !formData.courseId || !formData.semesterId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      })
      return
    }

    setIsLoading(true)

    try {
      const url =
        isEditMode && currentLecturerCourse
          ? `/api/lecturer-courses/${currentLecturerCourse.id}`
          : "/api/lecturer-courses"

      const method = isEditMode ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save lecturer course assignment")
      }

      const data = await res.json()

      toast({
        title: "Success",
        description: isEditMode
          ? "Lecturer course assignment updated successfully."
          : "Lecturer assigned to course successfully.",
      })

      // Refresh lecturer courses
      const lecturerCoursesRes = await fetch(`/api/lecturer-courses?semesterId=${selectedSemester}`)
      const lecturerCoursesData = await lecturerCoursesRes.json()
      setLecturerCourses(lecturerCoursesData)

      // Reset form and close dialog
      setFormData({
        lecturerId: "",
        courseId: "",
        semesterId: selectedSemester,
      })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setCurrentLecturerCourse(null)
    } catch (error) {
      console.error("Error saving lecturer course assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lecturer course assignment.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (lecturerCourse: LecturerCourse) => {
    setIsEditMode(true)
    setCurrentLecturerCourse(lecturerCourse)
    setFormData({
      lecturerId: lecturerCourse.lecturer.id,
      courseId: lecturerCourse.course.id,
      semesterId: lecturerCourse.semester.id,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lecturer course assignment?")) {
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/lecturer-courses/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete lecturer course assignment")
      }

      toast({
        title: "Success",
        description: "Lecturer course assignment deleted successfully.",
      })

      // Refresh lecturer courses
      const lecturerCoursesRes = await fetch(`/api/lecturer-courses?semesterId=${selectedSemester}`)
      const lecturerCoursesData = await lecturerCoursesRes.json()
      setLecturerCourses(lecturerCoursesData)
    } catch (error) {
      console.error("Error deleting lecturer course assignment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lecturer course assignment.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setCurrentLecturerCourse(null)
    setFormData({
      lecturerId: "",
      courseId: "",
      semesterId: selectedSemester,
    })
    setIsDialogOpen(true)
  }

  const filteredLecturerCourses = lecturerCourses.filter((lc) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      lc.lecturer.name.toLowerCase().includes(searchLower) ||
      lc.course.code.toLowerCase().includes(searchLower) ||
      lc.course.title.toLowerCase().includes(searchLower) ||
      lc.lecturer.department?.name.toLowerCase().includes(searchLower) ||
      false
    )
  })

  const columns: ColumnDef<LecturerCourse>[] = [
    {
      accessorKey: "lecturer.name",
      header: "Lecturer Name",
    },
    {
      accessorKey: "lecturer.department.name",
      header: "Department",
      cell: ({ row }) => {
        const department = row.original.lecturer.department?.name || "N/A"
        return <span>{department}</span>
      },
    },
    {
      accessorKey: "course.code",
      header: "Course Code",
    },
    {
      accessorKey: "course.title",
      header: "Course Title",
    },
    {
      accessorKey: "course.credits",
      header: "Credits",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lecturerCourse = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(lecturerCourse)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(lecturerCourse.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lecturer Course Assignments</CardTitle>
          <CardDescription>Manage lecturer assignments to courses for each semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemester} onValueChange={handleSemesterChange} disabled={isLoading}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} {semester.isActive && "(Active)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-64">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by lecturer or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddNew} disabled={isLoading || !selectedSemester} className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Assign Lecturer
            </Button>
          </div>

          <div className="mt-6">
            <DataTable
              columns={columns}
              data={filteredLecturerCourses}
              isLoading={isLoading}
              noDataText="No lecturer assignments found"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Lecturer Assignment" : "Assign Lecturer to Course"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the lecturer assignment details below."
                : "Select a lecturer and course to create an assignment."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="lecturerId">Lecturer</Label>
                <Select
                  value={formData.lecturerId}
                  onValueChange={(value) => handleSelectChange("lecturerId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="lecturerId">
                    <SelectValue placeholder="Select lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.name} {lecturer.department && `(${lecturer.department.name})`}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseId">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => handleSelectChange("courseId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semesterId">Semester</Label>
                <Select
                  value={formData.semesterId}
                  onValueChange={(value) => handleSelectChange("semesterId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="semesterId">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} {semester.isActive && "(Active)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditMode ? "Update" : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
