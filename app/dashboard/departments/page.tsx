"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
import { FileEdit, Loader2, PlusCircle, Trash2 } from "lucide-react"
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  updateDepartment,
} from "@/lib/actions/department-actions"

const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Department code must be at least 2 characters")
    .max(10, "Department code must be at most 10 characters"),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

export default function DepartmentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null)

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  })

  useEffect(() => {
    if (session?.user.role !== "REGISTRAR") {
      router.push("/dashboard")
    }

    const fetchDepartments = async () => {
      try {
        const result = await getAllDepartments()
        if (result.success) {
          setDepartments(result.departments)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch departments",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (session) {
      fetchDepartments()
    }
  }, [session, router, toast])

  async function onSubmit(data: DepartmentFormValues) {
    setIsLoading(true)
    try {
      let result
      if (isEditing && currentDepartmentId) {
        result = await updateDepartment(currentDepartmentId, data)
      } else {
        result = await createDepartment(data)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Department Updated" : "Department Created",
          description: isEditing
            ? "Department has been updated successfully."
            : "Department has been created successfully.",
        })
        form.reset()
        setIsDialogOpen(false)
        setIsEditing(false)
        setCurrentDepartmentId(null)

        // Refresh departments list
        const deptResult = await getAllDepartments()
        if (deptResult.success) {
          setDepartments(deptResult.departments)
        }
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${isEditing ? "update" : "create"} department. Please try again.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} department:`, error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEdit(department: any) {
    setIsEditing(true)
    setCurrentDepartmentId(department.id)
    form.reset({
      name: department.name,
      code: department.code,
    })
    setIsDialogOpen(true)
  }

  async function handleDeleteDepartment(departmentId: string) {
    setIsDeleting(true)
    try {
      const result = await deleteDepartment(departmentId)
      if (result.success) {
        toast({
          title: "Department Deleted",
          description: "Department has been deleted successfully.",
        })

        // Update local state
        setDepartments(departments.filter((dept) => dept.id !== departmentId))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete department. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDepartmentToDelete(null)
    }
  }

  if (session?.user.role !== "REGISTRAR") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Departments" text="Manage university departments.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false)
                setCurrentDepartmentId(null)
                form.reset({
                  name: "",
                  code: "",
                })
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the department details below." : "Enter the details for the new department."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Department Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department name" {...field} />
                      </FormControl>
                      <FormDescription>The full name of the department (e.g., Computer Science)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Department Code <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department code" {...field} />
                      </FormControl>
                      <FormDescription>A short code for the department (e.g., CS, ENG)</FormDescription>
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
                      "Update Department"
                    ) : (
                      "Create Department"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>View and manage all university departments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.courses?.length || 0}</TableCell>
                    <TableCell>{department.departmentStaff?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(department)}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDepartmentToDelete(department.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No departments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!departmentToDelete} onOpenChange={(open) => !open && setDepartmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action cannot be undone and will affect all
              associated courses and staff.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepartmentToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => departmentToDelete && handleDeleteDepartment(departmentToDelete)}
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
