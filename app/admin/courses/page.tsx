"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, Search } from "lucide-react"

// Mock data
const courses = [
  {
    id: "1",
    code: "CS101",
    title: "Introduction to Computer Science",
    credits: 3,
    department: "Computer Science",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    maxCapacity: 50,
    currentEnrolled: 42,
    faculty: "Dr. John Smith",
  },
  {
    id: "2",
    code: "EE201",
    title: "Digital Electronics",
    credits: 4,
    department: "Electrical Engineering",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    maxCapacity: 40,
    currentEnrolled: 38,
    faculty: "Dr. Emily Johnson",
  },
  {
    id: "3",
    code: "BA301",
    title: "Marketing Management",
    credits: 3,
    department: "Business Administration",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    maxCapacity: 60,
    currentEnrolled: 55,
    faculty: "Prof. Michael Brown",
  },
  {
    id: "4",
    code: "MED401",
    title: "Human Anatomy",
    credits: 5,
    department: "Medicine",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    maxCapacity: 30,
    currentEnrolled: 30,
    faculty: "Dr. Sarah Wilson",
  },
  {
    id: "5",
    code: "PHY201",
    title: "Classical Mechanics",
    credits: 4,
    department: "Physics",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    maxCapacity: 45,
    currentEnrolled: 32,
    faculty: "Dr. Robert Davis",
  },
]

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.faculty.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Course</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>Fill in the details to add a new course to the system.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code</Label>
                    <Input id="code" placeholder="e.g., CS101" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" placeholder="e.g., Introduction to Computer Science" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input id="credits" type="number" min="1" max="6" placeholder="3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="ee">Electrical Engineering</SelectItem>
                        <SelectItem value="ba">Business Administration</SelectItem>
                        <SelectItem value="med">Medicine</SelectItem>
                        <SelectItem value="phy">Physics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fall2023">Fall 2023</SelectItem>
                        <SelectItem value="spring2024">Spring 2024</SelectItem>
                        <SelectItem value="summer2024">Summer 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                    <Input id="maxCapacity" type="number" min="1" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="js">Dr. John Smith</SelectItem>
                        <SelectItem value="ej">Dr. Emily Johnson</SelectItem>
                        <SelectItem value="mb">Prof. Michael Brown</SelectItem>
                        <SelectItem value="sw">Dr. Sarah Wilson</SelectItem>
                        <SelectItem value="rd">Dr. Robert Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter course description..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites (comma separated)</Label>
                  <Input id="prerequisites" placeholder="e.g., CS100, MATH101" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden md:table-cell">Credits</TableHead>
                <TableHead className="hidden lg:table-cell">Faculty</TableHead>
                <TableHead className="hidden lg:table-cell">Enrollment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.department}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.credits}</TableCell>
                    <TableCell className="hidden lg:table-cell">{course.faculty}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={course.currentEnrolled >= course.maxCapacity ? "destructive" : "secondary"}>
                        {course.currentEnrolled}/{course.maxCapacity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Enrolled Students</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No courses found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

