"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
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
import { Eye, FileEdit, Loader2, PlusCircle, Trash2 } from "lucide-react"
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "@/lib/actions/course-actions"
import { getAllDepartments } from "@/lib/actions/department-actions"

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

export default function CoursesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResult = await getAllCourses()
        if (coursesResult.success) {
          setCourses(coursesResult.courses)
        } else {
          toast({
            title: "Error",
            description: coursesResult.message || "Failed to fetch courses",
            variant: "destructive",
          })
        }

        // Fetch departments
        const deptsResult = await getAllDepartments()
        if (deptsResult.success) {
          setDepartments(deptsResult.departments)
        } else {
          toast({
            title: "Error",
            description: deptsResult.message || "Failed to fetch departments",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

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

        // Refresh courses list
        const coursesResult = await getAllCourses()
        if (coursesResult.success) {
          setCourses(coursesResult.courses)
        }
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

  function handleEdit(course: any) {
    setIsEditing(true)
    setCurrentCourseId(course.id)
    form.reset({
      code: course.code,
      title: course.title,
      credits: course.credits,
      description: course.description || "",
      departmentId: course.departmentId,
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
        setCourses(courses.filter((course) => course.id !== courseId))
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

  const canManageCourses = session?.user.role === "STAFF" || session?.user.role === "REGISTRAR"

  return (
    <DashboardShell>
      <DashboardHeader heading="Courses" text="Manage university courses.">
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
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>View all courses offered by the university.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.department?.name || "Unknown"}</TableCell>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </DashboardShell>
  )
}
