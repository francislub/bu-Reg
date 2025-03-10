"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { registerForCourse } from "@/lib/actions/course-actions"
import { Loader2 } from "lucide-react"

interface Course {
  id: string
  courseCode: string
  title: string
  credits: number
  semester: string
  academicYear: string
  maxStudents: number
  currentStudents: number
}

interface Registration {
  id: string
  courseId: string
  status: string
  course: Course
}

interface CourseRegistrationFormProps {
  courses: Course[]
  registrations: Registration[]
}

export function CourseRegistrationForm({ courses, registrations }: CourseRegistrationFormProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCheckboxChange = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId])
    } else {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCourses.length === 0) {
      toast({
        title: "No Courses Selected",
        description: "Please select at least one course to register",
        variant: "destructive",
      })
      return
    }

    // Check if selected courses exceed the limit
    const currentSemesterRegistrations = registrations.filter(
      (r) => r.course.semester === "Spring" && r.course.academicYear === "2024-2025",
    )

    if (currentSemesterRegistrations.length + selectedCourses.length > 6) {
      toast({
        title: "Course Limit Exceeded",
        description: "You can register for a maximum of 6 courses per semester",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Register for each selected course
      for (const courseId of selectedCourses) {
        const course = courses.find((c) => c.id === courseId)
        if (!course) continue

        const formData = new FormData()
        formData.append("courseId", courseId)
        formData.append("semester", course.semester)
        formData.append("academicYear", course.academicYear)

        const result = await registerForCourse(formData)

        if (result.error) {
          toast({
            title: "Registration Failed",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Registration Successful",
            description: `You have successfully registered for ${course.courseCode}: ${course.title}`,
          })
        }
      }

      // Reset selected courses
      setSelectedCourses([])
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter out courses that the student is already registered for
  const registeredCourseIds = registrations.map((r) => r.courseId)
  const availableCourses = courses.filter((course) => !registeredCourseIds.includes(course.id))

  if (availableCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">
          You have registered for all available courses or there are no courses available for registration at this time.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium">
          <div className="col-span-1">Select</div>
          <div className="col-span-1">Code</div>
          <div className="col-span-2">Title</div>
          <div className="col-span-1">Credits</div>
          <div className="col-span-1">Seats</div>
        </div>
        <div className="divide-y">
          {availableCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-6 gap-4 p-4">
              <div className="col-span-1 flex items-center">
                <Checkbox
                  id={course.id}
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(course.id, checked as boolean)}
                />
              </div>
              <div className="col-span-1">{course.courseCode}</div>
              <div className="col-span-2">{course.title}</div>
              <div className="col-span-1">{course.credits}</div>
              <div className="col-span-1">
                {course.currentStudents}/{course.maxStudents}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting || selectedCourses.length === 0}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Register for Selected Courses"
        )}
      </Button>
    </form>
  )
}

