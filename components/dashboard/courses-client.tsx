"use client"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Eye, FileEdit, Loader2, PlusCircle, Trash2, RefreshCw, Search } from "lucide-react"
import { createCourse, deleteCourse, updateCourse } from "@/lib/actions/course-actions"
import { Badge } from "@/components/ui/badge"

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
})

type CourseFormValues = z.infer<typeof courseSchema>

export default function CoursesClient() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [localCourses, setLocalCourses] = useState<any[]>([])
  const [isTableLoading, setIsTableLoading] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [session])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/courses")
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses || [])
        setLocalCourses(data.courses || [])
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch courses",
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

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: "",
      title: "",
      credits: 3,
      description: "",
      departmentId: "",
    },
  })

  async function onSubmit(data: CourseFormValues) {
    setIsLoading(true)
    try {
      let result
      if (isEditing && currentCourseId) {
        result = await updateCourse(currentCourseId, data)
      } else {
        result = await createCourse(data)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Course Updated" : "Course Created",
          description: isEditing ? "Course has been updated successfully." : "Course has been created successfully.",
        })
        form.reset()
        setIsDialogOpen(false)
        setIsEditing(false)
        setCurrentCourseId(null)

        // Update local state
        if (isEditing) {
          setLocalCourses(
            localCourses.map((course) =>
              course.id === currentCourseId
                ? { ...course, ...data, department: courses.find((d) => d.id === data.departmentId) }
                : course,
            ),
          )
        } else if (result.course) {
          setLocalCourses([
            ...localCourses,
            {
              ...result.course,
              department: courses.find((d) => d.id === data.departmentId),
            },
          ])
        }
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${isEditing ? "update" : "create"} course. Please try again.`,
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

  function handleEdit(course: any) {
    setIsEditing(true)
    setCurrentCourseId(course.id)
    form.reset({
      code: course.code,
      title: course.title,
      credits: course.credits,
      description: course.description || "",
      departmentId: course.departmentId || courses[0]?.id || "",
    })
    setIsDialogOpen(true)
  }

  async function handleDeleteCourse(courseId: string) {
    setIsDeleting(true)
    try {
      const result = await deleteCourse(courseId)
      if (result.success) {
        toast({
          title: "Course Deleted",
          description: "Course has been deleted successfully.",
        })

        // Update local state
        setLocalCourses(localCourses.filter((course) => course.id !== courseId))
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete course. Please try again.",
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
    }
  }

  // Function to refresh courses
  const refreshCourses = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setLocalCourses(data.courses || [])
        toast({
          title: "Courses Refreshed",
          description: "Course list has been updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to refresh courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error refreshing courses:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while refreshing",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canManageCourses =
    session?.user.role === "STAFF" || session?.user.role === "REGISTRAR" || session?.user.role === "ADMIN"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>View and manage all courses</CardDescription>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  {canManageCourses && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.department?.name}</Badge>
                    </TableCell>
                    <TableCell>{course.credits}</TableCell>
                    {canManageCourses && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageCourses && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setCourseToDelete(course.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {canManageCourses && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false)
                setCurrentCourseId(null)
                form.reset({
                  code: "",
                  title: "",
                  credits: 3,
                  description: "",
                  departmentId: "",
                })
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Course" : "Add New Course"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the course details below." : "Enter the details for the new course."}
              </DialogDescription>
            </DialogHeader>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((dept) => (
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter course description" className="resize-none" {...field} />
                      </FormControl>
                      <FormDescription>A brief description of the course content</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
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
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone and will affect all students
              registered for this course.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => courseToDelete && handleDeleteCourse(courseToDelete)}
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
    </div>
  )
}
