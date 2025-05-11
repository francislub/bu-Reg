"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash2, Eye, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Student = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  profile?: {
    id?: string
    firstName?: string
    lastName?: string
    middleName?: string
    gender?: string
    dateOfBirth?: string
    nationality?: string
    phoneNumber?: string
    address?: string
    studentId?: string
    program?: string
    status?: string
    departmentId?: string
    avatar?: string
    programId?: string
  }
}

type Department = {
  id: string
  name: string
  code: string
}

// Add this function to handle student deletion
const deleteStudent = async (studentId: string) => {
  try {
    const response = await fetch(`/api/users/${studentId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete student")
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting student:", error)
    return { success: false, message: "Failed to delete student" }
  }
}

// Update the StudentsClient component to include more fields and delete functionality
export function StudentsClient({
  initialStudents,
  departments,
  programs,
}: { initialStudents: Student[]; departments: Department[]; programs: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState(initialStudents || [])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [programFilter, setProgramFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewingDetails, setIsViewingDetails] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)

  // Filter students based on search term and filters
  useEffect(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesProgram = !programFilter || student.profile?.programId === programFilter
      const matchesDepartment = !departmentFilter || student.profile?.departmentId === departmentFilter

      return matchesSearch && matchesProgram && matchesDepartment
    })

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.profile &&
            (student.profile.firstName?.toLowerCase().includes(query) ||
              student.profile.lastName?.toLowerCase().includes(query) ||
              student.profile.studentId?.toLowerCase().includes(query))),
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((student) => student.profile?.departmentId === selectedDepartment)
    }

    setFilteredStudents(filtered)
  }, [searchTerm, programFilter, departmentFilter, searchQuery, selectedDepartment, students])

  const handleDeleteStudent = async (studentId: string) => {
    setIsDeleting((prev) => ({ ...prev, [studentId]: true }))

    try {
      const result = await deleteStudent(studentId)

      if (result.success) {
        toast({
          title: "Student Deleted",
          description: "Student has been successfully deleted.",
        })

        // Remove the student from the local state
        setStudents((prev) => prev.filter((student) => student.id !== studentId))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete student.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting((prev) => ({ ...prev, [studentId]: false }))
    }
  }

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsViewingDetails(true)
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`)
  }

  const handleAddStudent = () => {
    router.push("/auth/register")
  }

  const handleExportStudents = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Student ID", "Gender", "Nationality", "Program", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student) =>
        [
          `"${student.profile?.firstName || ""} ${student.profile?.lastName || ""}"`,
          `"${student.email}"`,
          `"${student.profile?.studentId || "N/A"}"`,
          `"${student.profile?.gender || "Not specified"}"`,
          `"${student.profile?.nationality || "Not specified"}"`,
          `"${student.profile?.program || "Not specified"}"`,
          `"${student.profile?.status || "PENDING"}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "students.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Manage university students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs?.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.profile?.firstName} {student.profile?.middleName} {student.profile?.lastName}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.profile?.program || "Not assigned"}</TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/students/${student.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the student account and all
                                  associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleDeleteStudent(student.id)
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isDeleting[student.id] ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
