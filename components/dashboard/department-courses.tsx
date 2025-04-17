"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
// import { zodResolver } from "@zodResolver/zod"
import { zodResolver } from '@hookform/resolvers/zod'; 
import { Search, Plus, Edit, Trash, BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardPieChart } from "./charts/pie-chart"

const courseSchema = z.object({
  code: z.string().min(2, { message: "Course code is required" }),
  title: z.string().min(2, { message: "Course title is required" }),
  credits: z.coerce
    .number()
    .min(1, { message: "Credits must be at least 1" })
    .max(6, { message: "Credits cannot exceed 6" }),
  description: z.string().optional(),
})

type CourseFormValues = z.infer<typeof courseSchema>

export function DepartmentCourses({ departmentId }: { departmentId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [semesterCourses, setSemesterCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: "",
      title: "",
      credits: 3,
      description: "",
    },
  })

  const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: "",
      title: "",
      credits: 3,
      description: "",
    },
  })

  useEffect(() => {
    fetchCourses()
    fetchSemesterCourses()
  }, [departmentId])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/courses?departmentId=${departmentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSemesterCourses = async () => {
    try {
      const response = await fetch(`/api/semesters/current/courses?departmentId=${departmentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch semester courses")
      }
      const data = await response.json()
      setSemesterCourses(data)
    } catch (error) {
      console.error("Error fetching semester courses:", error)
    }
  }

  const onAddSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          departmentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create course")
      }

      toast({
        title: "Course created",
        description: "The course has been created successfully",
        variant: "default",
      })

      setIsAddDialogOpen(false)
      form.reset()
      fetchCourses()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onEditSubmit = async (data: CourseFormValues) => {
    if (!selectedCourse) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          departmentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update course")
      }

      toast({
        title: "Course updated",
        description: "The course has been updated successfully",
        variant: "default",
      })

      setIsEditDialogOpen(false)
      editForm.reset()
      fetchCourses()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete course")
      }

      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully",
        variant: "default",
      })

      setIsDeleteDialogOpen(false)
      fetchCourses()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete course",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (course: any) => {
    setSelectedCourse(course)
    editForm.reset({
      code: course.code,
      title: course.title,
      credits: course.credits,
      description: course.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (course: any) => {
    setSelectedCourse(course)
    setIsDeleteDialogOpen(true)
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate stats for charts
  const creditDistribution = [
    { name: "1 Credit", value: courses.filter((c) => c.credits === 1).length, color: "#94a3b8" },
    { name: "2 Credits", value: courses.filter((c) => c.credits === 2).length, color: "#60a5fa" },
    { name: "3 Credits", value: courses.filter((c) => c.credits === 3).length, color: "#34d399" },
    { name: "4 Credits", value: courses.filter((c) => c.credits === 4).length, color: "#a78bfa" },
    { name: "5+ Credits", value: courses.filter((c) => c.credits >= 5).length, color: "#f87171" },
  ].filter((item) => item.value > 0)

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.reduce((acc, course) => acc + course.credits, 0)} total credit hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{semesterCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {semesterCourses.reduce((acc, item) => acc + item.course.credits, 0)} credit hours this semester
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[150px]">
            {creditDistribution.length > 0 ? (
              <DashboardPieChart data={creditDistribution} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="active">Active This Semester</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Department Courses</CardTitle>
              <CardDescription>Manage courses for your department</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6">Loading courses...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No courses match your search criteria"
                      : "Your department doesn't have any courses yet"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col justify-between border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{course.code}</h3>
                          <Badge>
                            {course.credits} {course.credits === 1 ? "Credit" : "Credits"}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-2">{course.title}</h4>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(course)}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(course)}
                        >
                          <Trash className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Semester Courses</CardTitle>
              <CardDescription>Courses available for registration this semester</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6">Loading courses...</div>
              ) : semesterCourses.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active courses</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no courses from your department available for registration this semester.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contact the registrar to add courses to the current semester.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {semesterCourses.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{item.course.code}</h3>
                          <Badge>
                            {item.course.credits} {item.course.credits === 1 ? "Credit" : "Credits"}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-2">{item.course.title}</h4>
                        {item.course.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.course.description}</p>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <Check className="h-3 w-3 mr-1" />
                          Active this semester
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Add a new course to your department</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CS101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select credits" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Credit</SelectItem>
                          <SelectItem value="2">2 Credits</SelectItem>
                          <SelectItem value="3">3 Credits</SelectItem>
                          <SelectItem value="4">4 Credits</SelectItem>
                          <SelectItem value="5">5 Credits</SelectItem>
                          <SelectItem value="6">6 Credits</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter course description"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CS101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select credits" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Credit</SelectItem>
                          <SelectItem value="2">2 Credits</SelectItem>
                          <SelectItem value="3">3 Credits</SelectItem>
                          <SelectItem value="4">4 Credits</SelectItem>
                          <SelectItem value="5">5 Credits</SelectItem>
                          <SelectItem value="6">6 Credits</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter course description"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Course"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">
              {selectedCourse?.code}: {selectedCourse?.title}
            </p>
            <p className="text-sm text-muted-foreground">{selectedCourse?.credits} Credits</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCourse} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
