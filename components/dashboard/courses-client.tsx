"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FileEdit, Loader2, PlusCircle, Trash2, RefreshCw, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Update the courseSchema to include programs and semesters
const courseSchema = z.object({
  code: z
    .string()
    .min(2, "Course code must be at least 2 characters")
    .max(10, "Course code must be at most 10 characters"),
  title: z.string().min(3, "Course title must be at least 3 characters"),
  credits: z.coerce.number().int().min(1, "Credits must be at least 1").max(6, "Credits must be at most 6"),
  description: z.string().optional(),
  departmentId: z.string({
    required_error: "Please select a department",
  }),
  programIds: z.array(z.string()).optional(),
  semesterIds: z.array(z.string()).optional(),
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function CoursesClient() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)
  // Add state for programs and semesters
  const [programs, setPrograms] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Filtering state
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [creditFilter, setCreditFilter] = useState<number | null>(null)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: "",
      title: "",
      credits: 3,
      description: "",
      departmentId: "",
      programIds: [],
      semesterIds: [],
    },
  })

  // Update the useEffect to fetch programs and semesters
  useEffect(() => {
    fetchCourses()
    fetchPrograms()
    fetchSemesters()
  }, [currentPage, itemsPerPage, departmentFilter, creditFilter])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      // Add pagination and filter parameters to the API call
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })

      if (departmentFilter) {
        queryParams.append("departmentId", departmentFilter)
      }

      if (creditFilter) {
        queryParams.append("credits", creditFilter.toString())
      }

      if (searchTerm) {
        queryParams.append("search", searchTerm)
      }

      const response = await fetch(`/api/courses?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCourses(data.courses || [])
        setDepartments(data.departments || [])
        // Update total pages based on API response
        setTotalPages(data.totalPages || Math.ceil((data.totalCount || 0) / itemsPerPage))
        console.log("Courses fetched:", data.courses.length)
      } else {
        console.error("API returned error:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to fetch courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add functions to fetch programs and semesters
  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setPrograms(data.programs || [])
      } else {
        console.error("API returned error:", data.error)
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const fetchSemesters = async () => {
    try {
      const response = await fetch("/api/semesters")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setSemesters(data.semesters || [])
      } else {
        console.error("API returned error:", data.error)
      }
    } catch (error) {
      console.error("Error fetching semesters:", error)
    }
  }

  async function onSubmit(data: CourseFormValues) {
    try {
      setIsLoading(true)

      const payload = isEditing && currentCourseId ? { ...data, id: currentCourseId } : data

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: isEditing ? "Course Updated" : "Course Created",
          description: isEditing ? "Course has been updated successfully." : "Course has been created successfully.",
        })
        form.reset()
        setIsDialogOpen(false)
        setIsEditing(false)
        setCurrentCourseId(null)
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${isEditing ? "update" : "create"} course. Please try again.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} course:`, error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCourses()
    setIsRefreshing(false)
  }

  // Update the handleEdit function to include programs and semesters
  function handleEdit(course: any) {
    setIsEditing(true)
    setCurrentCourseId(course.id)
    setIsFetchingDetails(true)
    setIsDialogOpen(true)

    // Reset form with basic info first
    form.reset({
      code: course.code,
      title: course.title,
      credits: course.credits,
      description: course.description || "",
      departmentId: course.departmentId,
      programIds: [],
      semesterIds: [],
    })

    // Fetch course details including program and semester associations
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${course.id}`)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          const courseDetails = data.course
          form.reset({
            code: courseDetails.code,
            title: courseDetails.title,
            credits: courseDetails.credits,
            description: courseDetails.description || "",
            departmentId: courseDetails.departmentId,
            programIds: courseDetails.programCourses?.map((pc: any) => pc.programId) || [],
            semesterIds: courseDetails.semesterCourses?.map((sc: any) => sc.semesterId) || [],
          })
        }
      } catch (error) {
        console.error("Error fetching course details:", error)
        toast({
          title: "Warning",
          description: "Could not fetch all course details. Some associations may be missing.",
          variant: "warning",
        })
      } finally {
        setIsFetchingDetails(false)
      }
    }

    fetchCourseDetails()
  }

  async function handleDeleteCourse() {
    if (!courseToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/courses/${courseToDelete.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Course Deleted",
          description: "Course has been deleted successfully.",
        })
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete course. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setCourseToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    // Reset to first page when searching
    setCurrentPage(1)

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCourses()
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  // Filter courses based on search term (client-side filtering as backup)
  const filteredCourses = searchTerm
    ? courses.filter(
        (course) =>
          course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : courses

  const canManageCourses =
    session?.user.role === "STAFF" || session?.user.role === "REGISTRAR" || session?.user.role === "ADMIN"

  // Update the form reset in the "Add Course" button click handler
  const handleAddCourse = () => {
    setIsEditing(false)
    setCurrentCourseId(null)
    form.reset({
      code: "",
      title: "",
      credits: 3,
      description: "",
      departmentId: departments[0]?.id || "",
      programIds: [],
      semesterIds: [],
    })
    setIsDialogOpen(true)
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>,
        )
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>View and manage all courses</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>

              {canManageCourses && (
                <Button onClick={handleAddCourse}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={searchTerm} onChange={handleSearch} className="pl-8" />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Department</p>
                    <Select
                      value={departmentFilter || ""}
                      onValueChange={(value) => {
                        setDepartmentFilter(value || null)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
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

                    <p className="text-sm font-medium mt-4 mb-2">Credits</p>
                    <Select
                      value={creditFilter?.toString() || ""}
                      onValueChange={(value) => {
                        setCreditFilter(value ? Number.parseInt(value) : null)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Credits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Credits</SelectItem>
                        {[1, 2, 3, 4, 5, 6].map((credit) => (
                          <SelectItem key={credit} value={credit.toString()}>
                            {credit} {credit === 1 ? "Credit" : "Credits"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="rounded-md border">
              <ScrollArea className="h-[60vh]" scrollHideDelay={0} type="always">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background z-10 w-[100px]">Code</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10">Title</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10 w-[180px]">Department</TableHead>
                      <TableHead className="sticky top-0 bg-background z-10 w-[100px]">Credits</TableHead>
                      {canManageCourses && (
                        <TableHead className="sticky top-0 bg-background z-10 text-right w-[100px]">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          {course.department ? (
                            <Badge variant="outline">{course.department.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No department</span>
                          )}
                        </TableCell>
                        <TableCell>{course.credits}</TableCell>
                        {canManageCourses && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCourseToDelete(course)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground">No courses found.</p>
              {(searchTerm || departmentFilter || creditFilter) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("")
                    setDepartmentFilter(null)
                    setCreditFilter(null)
                    setCurrentPage(1)
                    fetchCourses()
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredCourses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* Create/Edit Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-0">
            <DialogTitle>{isEditing ? "Edit Course" : "Add New Course"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the course details below." : "Enter the details for the new course."}
            </DialogDescription>
          </DialogHeader>

          {isFetchingDetails && isEditing ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading course details...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <ScrollArea
                className="h-[calc(75vh-120px)] pr-4"
                scrollHideDelay={0}
                type="always"
                style={{
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
                }}
              >
                <div className="pr-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Course Code <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., CS101" {...field} />
                              </FormControl>
                              <FormDescription>A unique identifier for the course</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="credits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Credits <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={6} {...field} />
                              </FormControl>
                              <FormDescription>Number of credit hours (1-6)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Course Title <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Introduction to Computer Science" {...field} />
                            </FormControl>
                            <FormDescription>The full title of the course</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Department <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>The department offering this course</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="programIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Programs</FormLabel>
                            <div className="border rounded-md">
                              <ScrollArea className="h-[150px]" scrollHideDelay={0} type="always">
                                <div className="space-y-2 p-4">
                                  {programs.length > 0 ? (
                                    programs.map((program) => (
                                      <div key={program.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`program-${program.id}`}
                                          checked={field.value?.includes(program.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...(field.value || []), program.id]
                                              : (field.value || []).filter((id) => id !== program.id)
                                            field.onChange(updatedValue)
                                          }}
                                        />
                                        <label
                                          htmlFor={`program-${program.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {program.name}
                                        </label>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No programs available</p>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                            <FormDescription>Select the programs this course belongs to</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="semesterIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Semesters</FormLabel>
                            <div className="border rounded-md">
                              <ScrollArea className="h-[150px]" scrollHideDelay={0} type="always">
                                <div className="space-y-2 p-4">
                                  {semesters.length > 0 ? (
                                    semesters.map((semester) => (
                                      <div key={semester.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`semester-${semester.id}`}
                                          checked={field.value?.includes(semester.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...(field.value || []), semester.id]
                                              : (field.value || []).filter((id) => id !== semester.id)
                                            field.onChange(updatedValue)
                                          }}
                                        />
                                        <label
                                          htmlFor={`semester-${semester.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {semester.name} ({semester.academicYear?.name || "Unknown Academic Year"})
                                        </label>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No semesters available</p>
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                            <FormDescription>Select the semesters this course is offered in</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter course description"
                                className="resize-none min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>A brief description of the course content</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="h-4"></div> {/* Spacer for bottom padding in scroll area */}
                    </form>
                  </Form>
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading || isFetchingDetails}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Course"
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone and may
              affect students registered for this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
