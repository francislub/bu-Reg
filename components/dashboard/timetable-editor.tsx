"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type Course = {
  id: string
  code: string
  title: string
}

type LecturerCourse = {
  id: string
  lecturer: {
    id: string
    name: string
  }
  course: Course
}

type TimetableSlot = {
  id: string
  timetableId: string
  courseId: string
  lecturerCourseId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomNumber: string
  course: Course
  lecturerCourse?: LecturerCourse
}

type Timetable = {
  id: string
  name: string
  semesterId: string
  slots: TimetableSlot[]
}

interface TimetableEditorProps {
  timetable: Timetable
  onSave: () => void
}

export function TimetableEditor({ timetable, onSave }: TimetableEditorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [slots, setSlots] = useState<TimetableSlot[]>(timetable.slots)
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturerCourses, setLecturerCourses] = useState<LecturerCourse[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<TimetableSlot | null>(null)
  const [formData, setFormData] = useState({
    courseId: "",
    lecturerCourseId: "",
    dayOfWeek: "1", // Monday by default
    startTime: "08:00",
    endTime: "10:00",
    roomNumber: "",
  })
  const [activeDay, setActiveDay] = useState("1") // Monday by default

  const days = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch courses
        const coursesRes = await fetch(`/api/semesters/${timetable.semesterId}/courses`)
        const coursesData = await coursesRes.json()
        setCourses(coursesData)

        // Fetch lecturer courses
        const lecturerCoursesRes = await fetch(`/api/lecturer-courses?semesterId=${timetable.semesterId}`)
        const lecturerCoursesData = await lecturerCoursesRes.json()
        setLecturerCourses(lecturerCoursesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timetable.semesterId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "courseId" && value) {
      // If course is selected, filter lecturer courses for this course
      const matchingLecturerCourse = lecturerCourses.find((lc) => lc.course.id === value)
      if (matchingLecturerCourse) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          lecturerCourseId: matchingLecturerCourse.id,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          lecturerCourseId: "",
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.courseId || !formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.roomNumber) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsLoading(true)

    try {
      const url =
        isEditMode && currentSlot
          ? `/api/timetables/${timetable.id}/slots/${currentSlot.id}`
          : `/api/timetables/${timetable.id}/slots`

      const method = isEditMode ? "PUT" : "POST"

      const payload = {
        ...formData,
        dayOfWeek: Number.parseInt(formData.dayOfWeek),
        timetableId: timetable.id,
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save timetable slot")
      }

      const data = await res.json()

      toast({
        title: "Success",
        description: isEditMode ? "Timetable slot updated successfully." : "Timetable slot added successfully.",
      })

      // Refresh slots
      const slotsRes = await fetch(`/api/timetables/${timetable.id}`)
      const timetableData = await slotsRes.json()
      setSlots(timetableData.slots)

      // Reset form and close dialog
      setFormData({
        courseId: "",
        lecturerCourseId: "",
        dayOfWeek: activeDay,
        startTime: "08:00",
        endTime: "10:00",
        roomNumber: "",
      })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setCurrentSlot(null)

      // Notify parent component
      onSave()
    } catch (error) {
      console.error("Error saving timetable slot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save timetable slot.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (slot: TimetableSlot) => {
    setIsEditMode(true)
    setCurrentSlot(slot)
    setFormData({
      courseId: slot.courseId,
      lecturerCourseId: slot.lecturerCourseId || "",
      dayOfWeek: slot.dayOfWeek.toString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      roomNumber: slot.roomNumber,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable slot?")) {
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/timetables/${timetable.id}/slots/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete timetable slot")
      }

      toast({
        title: "Success",
        description: "Timetable slot deleted successfully.",
      })

      // Refresh slots
      const slotsRes = await fetch(`/api/timetables/${timetable.id}`)
      const timetableData = await slotsRes.json()
      setSlots(timetableData.slots)

      // Notify parent component
      onSave()
    } catch (error) {
      console.error("Error deleting timetable slot:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete timetable slot.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setCurrentSlot(null)
    setFormData({
      courseId: "",
      lecturerCourseId: "",
      dayOfWeek: activeDay,
      startTime: "08:00",
      endTime: "10:00",
      roomNumber: "",
    })
    setIsDialogOpen(true)
  }

  // Group slots by day
  const slotsByDay = slots.reduce(
    (acc, slot) => {
      const day = slot.dayOfWeek.toString()
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(slot)
      return acc
    },
    {} as Record<string, TimetableSlot[]>,
  )

  // Sort slots by start time
  Object.keys(slotsByDay).forEach((day) => {
    slotsByDay[day].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  })

  // Format time (convert 24h to 12h format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Get filtered lecturer courses based on selected course
  const getFilteredLecturerCourses = () => {
    if (!formData.courseId) return []
    return lecturerCourses.filter((lc) => lc.course.id === formData.courseId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Edit Timetable Slots</h2>
        <Button onClick={handleAddNew} disabled={isLoading} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Slot
        </Button>
      </div>

      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-cols-7">
          {days.map((day) => (
            <TabsTrigger key={day.value} value={day.value}>
              {day.label.substring(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day.value} value={day.value} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{day.label}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, dayOfWeek: day.value }))
                  handleAddNew()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to {day.label}
              </Button>
            </div>

            {!slotsByDay[day.value] || slotsByDay[day.value].length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No classes scheduled for {day.label}.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, dayOfWeek: day.value }))
                    handleAddNew()
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slotsByDay[day.value].map((slot) => (
                  <Card key={slot.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{slot.course.code}</CardTitle>
                        <Badge className="ml-2">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{slot.course.title}</p>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Lecturer:</span>
                          <span>{slot.lecturerCourse?.lecturer.name || "Not assigned"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Room:</span>
                          <span>{slot.roomNumber}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 pt-0">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(slot)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(slot.id)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Timetable Slot" : "Add Timetable Slot"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the timetable slot details below."
                : "Enter the details for the new timetable slot."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="courseId">Course</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => handleSelectChange("courseId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.title}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lecturerCourseId">Lecturer</Label>
                <Select
                  value={formData.lecturerCourseId}
                  onValueChange={(value) => handleSelectChange("lecturerCourseId", value)}
                  disabled={isLoading || !formData.courseId}
                >
                  <SelectTrigger id="lecturerCourseId">
                    <SelectValue placeholder={formData.courseId ? "Select lecturer" : "Select a course first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredLecturerCourses().length === 0 ? (
                      <SelectItem value="" disabled>
                        No lecturers assigned to this course
                      </SelectItem>
                    ) : (
                      getFilteredLecturerCourses().map((lc) => (
                        <SelectItem key={lc.id} value={lc.id}>
                          {lc.lecturer.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dayOfWeek">Day</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => handleSelectChange("dayOfWeek", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  placeholder="e.g., B101"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditMode ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
