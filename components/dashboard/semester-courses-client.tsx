"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { addCourseToSemester, removeCourseFromSemester } from "@/lib/actions/semester-actions"
import { formatCreditHours } from "@/lib/utils"
import { PlusCircle, Search, Trash2, Loader2 } from "lucide-react"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  department: {
    id: string
    name: string
  }
}

interface SemesterCoursesClientProps {
  semesterId: string
  semesterCourses: Course[]
  availableCourses: Course[]
}

export function SemesterCoursesClient({ semesterId, semesterCourses, availableCourses }: SemesterCoursesClientProps) {
  const { toast } = useToast()
  const [isAddingCourses, setIsAddingCourses] = useState(false)
  const [isRemovingCourse, setIsRemovingCourse] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [courseToRemove, setCourseToRemove] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddCourses = async () => {
    if (selectedCourses.length === 0) return

    setIsAddingCourses(true)
    try {
      // Add each selected course to the semester
      for (const courseId of selectedCourses) {
        const result = await addCourseToSemester(semesterId, courseId)
        if (!result.success) {
          toast({
            title: "Error",
            description: result.message || "Failed to add course to semester",
            variant: "destructive",
          })
        }
      }

      toast({
        title: "Courses Added",
        description: `Successfully added ${selectedCourses.length} course(s) to the semester.`,
      })

      // Reset state and close dialog
      setSelectedCourses([])
      setShowAddDialog(false)

      // Refresh the page to show updated courses
      window.location.reload()
    } catch (error) {
      console.error("Error adding courses to semester:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingCourses(false)
    }
  }

  const handleRemoveCourse = async () => {
    if (!courseToRemove) return

    setIsRemovingCourse(true)
    try {
      const result = await removeCourseFromSemester(semesterId, courseToRemove)

      if (result.success) {
        toast({
          title: "Course Removed",
          description: "The course has been removed from the semester.",
        })

        // Refresh the page to show updated courses
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove course from semester",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing course from semester:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRemovingCourse(false)
      setCourseToRemove(null)
    }
  }

  // Filter available courses based on search query
  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Semester Courses</CardTitle>
            <CardDescription>Courses offered in this semester.</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Courses
          </Button>
        </CardHeader>
        <CardContent>
          {semesterCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesterCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.department.name}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setCourseToRemove(course.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium">No Courses</h3>
              <p className="text-muted-foreground mt-2">
                There are no courses in this semester yet. Click the button above to add courses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Courses Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Courses to Semester</DialogTitle>
            <DialogDescription>Select the courses you want to add to this semester.</DialogDescription>
          </DialogHeader>

          <div className="relative my-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="py-4">
            {filteredAvailableCourses.length > 0 ? (
              <div className="space-y-4">
                {filteredAvailableCourses.map((course) => (
                  <div key={course.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCourses([...selectedCourses, course.id])
                        } else {
                          setSelectedCourses(selectedCourses.filter((id) => id !== course.id))
                        }
                      }}
                    />
                    <div className="space-y-1 leading-none">
                      <p className="text-base font-medium">
                        {course.code}: {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCreditHours(course.credits)} | {course.department.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                {availableCourses.length === 0
                  ? "No additional courses available to add."
                  : "No courses match your search."}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCourses} disabled={isAddingCourses || selectedCourses.length === 0}>
              {isAddingCourses ? (
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

      {/* Remove Course Confirmation Dialog */}
      <Dialog open={!!courseToRemove} onOpenChange={(open) => !open && setCourseToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Course</DialogTitle>
            <DialogDescription>Are you sure you want to remove this course from the semester?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveCourse} disabled={isRemovingCourse}>
              {isRemovingCourse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
