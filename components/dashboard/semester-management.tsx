"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Edit, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const semesterSchema = z.object({
  name: z.string().min(2, { message: "Semester name is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  registrationDeadline: z.string().min(1, { message: "Registration deadline is required" }),
  courseUploadDeadline: z.string().min(1, { message: "Course upload deadline is required" }),
  isActive: z.boolean().default(false),
})

type SemesterFormValues = z.infer<typeof semesterSchema>

export function SemesterManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [semesters, setSemesters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      registrationDeadline: "",
      courseUploadDeadline: "",
      isActive: false,
    },
  })

  const editForm = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      registrationDeadline: "",
      courseUploadDeadline: "",
      isActive: false,
    },
  })

  useEffect(() => {
    fetchSemesters()
  }, [])

  const fetchSemesters = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/semesters")
      if (!response.ok) {
        throw new Error("Failed to fetch semesters")
      }
      const data = await response.json()
      setSemesters(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch semesters",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onAddSubmit = async (data: SemesterFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/semesters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create semester")
      }

      toast({
        title: "Semester created",
        description: "The semester has been created successfully",
        variant: "default",
      })

      setIsAddDialogOpen(false)
      form.reset()
      fetchSemesters()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create semester",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onEditSubmit = async (data: SemesterFormValues) => {
    if (!selectedSemester) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/semesters/${selectedSemester.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update semester")
      }

      toast({
        title: "Semester updated",
        description: "The semester has been updated successfully",
        variant: "default",
      })

      setIsEditDialogOpen(false)
      editForm.reset()
      fetchSemesters()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update semester",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSemester) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/semesters/${selectedSemester.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete semester")
      }

      toast({
        title: "Semester deleted",
        description: "The semester has been deleted successfully",
        variant: "default",
      })

      setIsDeleteDialogOpen(false)
      fetchSemesters()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete semester",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (semester: any) => {
    setSelectedSemester(semester)
    editForm.reset({
      name: semester.name,
      startDate: new Date(semester.startDate).toISOString().split("T")[0],
      endDate: new Date(semester.endDate).toISOString().split("T")[0],
      registrationDeadline: semester.registrationDeadline
        ? new Date(semester.registrationDeadline).toISOString().split("T")[0]
        : "",
      courseUploadDeadline: semester.courseUploadDeadline
        ? new Date(semester.courseUploadDeadline).toISOString().split("T")[0]
        : "",
      isActive: semester.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (semester: any) => {
    setSelectedSemester(semester)
    setIsDeleteDialogOpen(true)
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Semester
        </Button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading semesters...</div>
            </CardContent>
          </Card>
        ) : semesters.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Semesters Found</h3>
                <p className="text-muted-foreground mb-4">There are no semesters created yet.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Semester
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          semesters.map((semester) => (
            <Card key={semester.id} className={semester.isActive ? "border-green-500" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    {semester.name}
                    {semester.isActive && <Badge className="ml-2 bg-green-500 hover:bg-green-600">Active</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(new Date(semester.startDate))} - {formatDate(new Date(semester.endDate))}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(semester)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteClick(semester)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Registration Deadline</h4>
                    <p className="text-sm text-muted-foreground">
                      {semester.registrationDeadline ? formatDate(new Date(semester.registrationDeadline)) : "Not set"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Course Upload Deadline</h4>
                    <p className="text-sm text-muted-foreground">
                      {semester.courseUploadDeadline ? formatDate(new Date(semester.courseUploadDeadline)) : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Semester Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Semester</DialogTitle>
            <DialogDescription>Create a new academic semester</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fall 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registrationDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseUploadDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Upload Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Semester</FormLabel>
                      <FormDescription>
                        Mark this as the active semester. This will deactivate any other active semester.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Semester"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Semester Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Semester</DialogTitle>
            <DialogDescription>Update semester details</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Fall 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="registrationDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="courseUploadDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Upload Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Semester</FormLabel>
                      <FormDescription>
                        Mark this as the active semester. This will deactivate any other active semester.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Semester"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Semester Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Semester</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this semester? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">{selectedSemester?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedSemester?.startDate && formatDate(new Date(selectedSemester.startDate))} -{" "}
              {selectedSemester?.endDate && formatDate(new Date(selectedSemester.endDate))}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Semester"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
