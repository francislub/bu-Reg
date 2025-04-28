"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
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
import { Loader2, Pencil, Trash, Plus } from "lucide-react"

type Department = {
  id: string
  name: string
  code: string
}

type Course = {
  id: string
  code: string
  title: string
  credits: number
  description?: string
  department: {
    id: string
    name: string
  }
}

type Program = {
  id: string
  name: string
  code: string
  type: string
  duration: number
  departmentId: string
  description?: string
  department: {
    id: string
    name: string
    code: string
  }
  programCourses: {
    id: string
    course: Course
  }[]
}

type ProgramDetailClientProps = {
  program: Program
  allCourses: Course[]
  isRegistrar: boolean
}

export function ProgramDetailClient({ program, allCourses, isRegistrar }: ProgramDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddCoursesDialog, setShowAddCoursesDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: program.name,
    code: program.code,
    type: program.type,
    duration: program.duration,
    departmentId: program.departmentId,
    description: program.description || "",
  })
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  // Filter out courses that are already in the program
  const availableCourses = allCourses.filter(
    (course) => !program.programCourses.some((pc) => pc.course.id === course.id),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update program")
      }

      toast({
        title: "Program Updated",
        description: "The program has been updated successfully.",
      })

      setShowEditDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating program:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProgram = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete program")
      }

      toast({
        title: "Program Deleted",
        description: "The program has been deleted successfully.",
      })

      setShowDeleteDialog(false)
      router.push("/dashboard/programs")
    } catch (error) {
      console.error("Error deleting program:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourses = async () => {
    if (selectedCourses.length === 0) {
      toast({
        title: "No Courses Selected",
        description: "Please select at least one course to add to the program.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/programs/${program.id}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds: selectedCourses }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add courses to program")
      }

      toast({
        title: "Courses Added",
        description: `Successfully added ${selectedCourses.length} course(s) to the program.`,
      })

      setShowAddCoursesDialog(false)
      setSelectedCourses([])
      router.refresh()
    } catch (error) {
      console.error("Error adding courses to program:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add courses to program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCourse = async (courseId: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/programs/${program.id}/courses?courseId=${courseId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove course from program")
      }

      toast({
        title: "Course Removed",
        description: "The course has been removed from the program successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error removing course from program:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove course from program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Program Details</h2>
          <p className="text-sm text-muted-foreground">
            View and manage details for {program.name} ({program.code})
          </p>
        </div>
        {isRegistrar && (
          <div className="flex space-x-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Program
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Program</DialogTitle>
                  <DialogDescription>Make changes to the program details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProgram}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Program Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Bachelor of Science in Computer Science"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Program Code</Label>
                        <Input
                          id="code"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          placeholder="BSC-CS"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Program Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleSelectChange("type", value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DIPLOMA">Diploma</SelectItem>
                            <SelectItem value="BACHELORS">Bachelor's Degree</SelectItem>
                            <SelectItem value="MASTERS">Master's Degree</SelectItem>
                            <SelectItem value="PHD">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (years)</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min={1}
                          max={10}
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Program description and objectives"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Program"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Program
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the program and remove all associated
                    course relationships.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProgram} disabled={isLoading}>
                    {isLoading ? (
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
            <CardDescription>Basic details about the program</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-base">{program.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Code</dt>
                <dd className="text-base">{program.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                <dd className="text-base">
                  <Badge variant="outline" className="capitalize">
                    {program.type.toLowerCase()}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                <dd className="text-base">{program.duration} years</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Department</dt>
                <dd className="text-base">{program.department.name}</dd>
              </div>
              {program.description && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="text-base">{program.description}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Program Courses</CardTitle>
              <CardDescription>Courses offered in this program</CardDescription>
            </div>
            {isRegistrar && (
              <Dialog open={showAddCoursesDialog} onOpenChange={setShowAddCoursesDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Courses
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px]">
                  <DialogHeader>
                    <DialogTitle>Add Courses to Program</DialogTitle>
                    <DialogDescription>Select courses to add to the {program.name} program.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Title</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableCourses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                No available courses to add
                              </TableCell>
                            </TableRow>
                          ) : (
                            availableCourses.map((course) => (
                              <TableRow key={course.id}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    checked={selectedCourses.includes(course.id)}
                                    onChange={() => handleCourseSelection(course.id)}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </TableCell>
                                <TableCell>{course.code}</TableCell>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                                <TableCell>{course.department.name}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddCoursesDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCourses} disabled={isLoading || selectedCourses.length === 0}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        `Add ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""}`
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Department</TableHead>
                  {isRegistrar && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {program.programCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isRegistrar ? 5 : 4} className="h-24 text-center">
                      No courses in this program
                    </TableCell>
                  </TableRow>
                ) : (
                  program.programCourses.map((pc) => (
                    <TableRow key={pc.id}>
                      <TableCell>{pc.course.code}</TableCell>
                      <TableCell>{pc.course.title}</TableCell>
                      <TableCell>{pc.course.credits}</TableCell>
                      <TableCell>{pc.course.department.name}</TableCell>
                      {isRegistrar && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCourse(pc.course.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
