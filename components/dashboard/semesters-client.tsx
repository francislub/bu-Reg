"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, CalendarIcon, CheckCircle2, Clock, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type Semester = {
  id: string
  name: string
  academicYearId: string
  startDate: Date
  endDate: Date
  isActive: boolean
  registrationDeadline?: Date | null
  courseUploadDeadline?: Date | null
  academicYear: {
    id: string
    name: string
  }
  semesterCourses: {
    id: string
    course: {
      id: string
      code: string
      title: string
    }
  }[]
}

type AcademicYear = {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

type SemestersClientProps = {
  semesters: Semester[]
  academicYears: AcademicYear[]
  isRegistrar: boolean
}

export function SemestersClient({ semesters, academicYears, isRegistrar }: SemestersClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showNewSemesterDialog, setShowNewSemesterDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    academicYearId: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
    isActive: false,
    registrationDeadline: new Date(new Date().setDate(new Date().getDate() + 14)),
    courseUploadDeadline: new Date(new Date().setDate(new Date().getDate() + 21)),
  })

  // Group semesters by academic year
  const semestersByYear = semesters.reduce(
    (acc, semester) => {
      const yearId = semester.academicYear.id
      if (!acc[yearId]) {
        acc[yearId] = []
      }
      acc[yearId].push(semester)
      return acc
    },
    {} as Record<string, Semester[]>,
  )

  // Get active semesters
  const activeSemesters = semesters.filter((s) => s.isActive)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/semesters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create semester")
      }

      toast({
        title: "Semester Created",
        description: "The academic semester has been created successfully.",
      })

      setShowNewSemesterDialog(false)
      setFormData({
        name: "",
        academicYearId: "",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        isActive: false,
        registrationDeadline: new Date(new Date().setDate(new Date().getDate() + 14)),
        courseUploadDeadline: new Date(new Date().setDate(new Date().getDate() + 21)),
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating semester:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create semester. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewSemester = (semesterId: string) => {
    router.push(`/dashboard/semesters/${semesterId}`)
  }

  const handleViewSemesterCourses = (semesterId: string) => {
    router.push(`/dashboard/semesters/${semesterId}/courses`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Semesters</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{semesters.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Semesters</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSemesters.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Years</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{academicYears.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {semesters.reduce((acc, s) => acc + s.semesterCourses.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Semesters</h2>
        {isRegistrar && (
          <Dialog open={showNewSemesterDialog} onOpenChange={setShowNewSemesterDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Academic Semester</DialogTitle>
                <DialogDescription>
                  Create a new academic semester for the university. Fill in all the required fields.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Semester Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Fall 2023"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYearId">Academic Year</Label>
                      <Select
                        value={formData.academicYearId}
                        onValueChange={(value) => handleSelectChange("academicYearId", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleDateChange("startDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleDateChange("endDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Registration Deadline</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.registrationDeadline && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.registrationDeadline ? (
                              format(formData.registrationDeadline, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.registrationDeadline}
                            onSelect={(date) => handleDateChange("registrationDeadline", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Course Upload Deadline</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.courseUploadDeadline && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.courseUploadDeadline ? (
                              format(formData.courseUploadDeadline, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.courseUploadDeadline}
                            onSelect={(date) => handleDateChange("courseUploadDeadline", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                    />
                    <Label htmlFor="isActive">Set as active semester</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowNewSemesterDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Semester"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Semesters</TabsTrigger>
          <TabsTrigger value="active">Active Semesters</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {Object.entries(semestersByYear).map(([yearId, yearSemesters]) => {
            const academicYear = academicYears.find((y) => y.id === yearId)
            return (
              <div key={yearId} className="mb-6">
                <h3 className="text-lg font-medium mb-3">{academicYear?.name || "Unknown Academic Year"}</h3>
                <SemestersTable
                  semesters={yearSemesters}
                  onViewSemester={handleViewSemester}
                  onViewCourses={handleViewSemesterCourses}
                />
              </div>
            )
          })}
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <SemestersTable
            semesters={activeSemesters}
            onViewSemester={handleViewSemester}
            onViewCourses={handleViewSemesterCourses}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SemestersTable({
  semesters,
  onViewSemester,
  onViewCourses,
}: {
  semesters: Semester[]
  onViewSemester: (id: string) => void
  onViewCourses: (id: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Semester Name</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No semesters found
                </TableCell>
              </TableRow>
            ) : (
              semesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell className="font-medium">{semester.name}</TableCell>
                  <TableCell>{semester.academicYear.name}</TableCell>
                  <TableCell>{format(new Date(semester.startDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(semester.endDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={semester.isActive ? "success" : "outline"}>
                      {semester.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{semester.semesterCourses.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewCourses(semester.id)}>
                        Courses
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onViewSemester(semester.id)}>
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
