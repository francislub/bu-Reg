"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  UserPlus,
  Download,
  Filter,
  MoreHorizontal,
  GraduationCap,
  Trash2,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Loader2,
} from "lucide-react"

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
  }
}

type Department = {
  id: string
  name: string
  code: string
}

export function StudentsClient({
  initialStudents,
  departments,
}: { initialStudents: Student[]; departments: Department[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewingDetails, setIsViewingDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let filtered = students

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
  }, [searchQuery, selectedDepartment, students])

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsViewingDetails(true)
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`)
  }

  const handleDeleteStudent = async (studentId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${studentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Student deleted successfully",
        })
        setStudents(students.filter((student) => student.id !== studentId))
        setFilteredStudents(filteredStudents.filter((student) => student.id !== studentId))
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete student",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setStudentToDelete(null)
    }
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
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">Manage and view all students enrolled at Bugema University.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Students</CardTitle>
            <CardDescription>All registered students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Students</CardTitle>
            <CardDescription>Currently active students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {students.filter((s) => s.profile?.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pending Students</CardTitle>
            <CardDescription>Students awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {students.filter((s) => !s.profile?.status || s.profile?.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="w-full pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Departments" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9" onClick={handleExportStudents}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="h-9" onClick={handleAddStudent}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "grid")}>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
            </div>
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="mt-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-0">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b bg-muted/50">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Program</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <GraduationCap className="h-8 w-8 mb-2" />
                              <p>No students found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={student.profile?.avatar || ""} alt={student.name} />
                                  <AvatarFallback>{student.name?.substring(0, 2).toUpperCase() || "ST"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.profile?.firstName} {student.profile?.lastName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <span className="font-mono text-xs">{student.profile?.studentId || "N/A"}</span>
                            </td>
                            <td className="p-4 align-middle">{student.email}</td>
                            <td className="p-4 align-middle">
                              <span className="text-sm">{student.profile?.program || "Not specified"}</span>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge
                                variant="outline"
                                className={
                                  student.profile?.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : student.profile?.status === "SUSPENDED"
                                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }
                              >
                                {student.profile?.status || "PENDING"}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                                      <GraduationCap className="mr-2 h-4 w-4" />
                                      Academic Records
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setStudentToDelete(student.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grid" className="mt-4">
            {filteredStudents.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">No students found</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.profile?.avatar || ""} alt={student.name} />
                            <AvatarFallback>{student.name?.substring(0, 2).toUpperCase() || "ST"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {student.profile
                                ? `${student.profile.firstName || ""} ${student.profile.lastName || ""}`
                                : student.name}
                            </CardTitle>
                            <CardDescription>{student.email}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                              <GraduationCap className="mr-2 h-4 w-4" />
                              Academic Records
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setStudentToDelete(student.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <User className="mr-2 h-4 w-4" />
                          {student.profile?.gender || "Gender not specified"}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          {student.profile?.program || "Program not specified"}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {student.profile?.nationality || "Nationality not specified"}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t bg-slate-50">
                      <div className="w-full flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className={
                            student.profile?.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : student.profile?.status === "SUSPENDED"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {student.profile?.status || "PENDING"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(student)}>
                          View Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone and will remove all associated
              data including course registrations and attendance records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => studentToDelete && handleDeleteStudent(studentToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Comprehensive information about the student</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedStudent.profile
                        ? `${selectedStudent.profile.firstName || ""} ${selectedStudent.profile.middleName || ""} ${selectedStudent.profile.lastName || ""}`
                        : selectedStudent.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedStudent.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{selectedStudent.profile?.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedStudent.profile?.dateOfBirth
                        ? new Date(selectedStudent.profile.dateOfBirth).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedStudent.profile?.phoneNumber || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedStudent.profile?.nationality || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Academic Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium">{selectedStudent.profile?.studentId || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">
                      {departments.find((d) => d.id === selectedStudent.profile?.departmentId)?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Program</p>
                    <p className="font-medium">{selectedStudent.profile?.program || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="font-medium">
                      <Badge
                        variant="outline"
                        className={
                          selectedStudent.profile?.status === "ACTIVE"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : selectedStudent.profile?.status === "SUSPENDED"
                              ? "bg-red-100 text-red-800 hover:bg-red-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                      >
                        {selectedStudent.profile?.status || "PENDING"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewingDetails(false)
                        handleViewStudent(selectedStudent.id)
                      }}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Academic Records
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setIsViewingDetails(false)
                        setStudentToDelete(selectedStudent.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Student
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewingDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
