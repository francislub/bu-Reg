"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, Info, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const registrationSchema = z.object({
  courses: z.array(z.string()).min(1, {
    message: "You must select at least one course",
  }),
})

type RegistrationFormValues = z.infer<typeof registrationSchema>

export function CourseRegistrationForm({
  userId,
  semester,
  availableCourses,
}: {
  userId: string
  semester: any
  availableCourses: any[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      courses: [],
    },
  })

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true)
    try {
      // In a real application, you would send this data to your API
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          semesterId: semester.id,
          courseIds: data.courses,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to register courses")
      }

      toast({
        title: "Courses registered successfully",
        description: "Your course registration has been submitted for approval",
        variant: "default",
      })

      // Reset form
      form.reset()
      setSelectedCourses([])

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was an error submitting your course registration",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId])
      form.setValue("courses", [...selectedCourses, courseId])
    } else {
      const filtered = selectedCourses.filter((id) => id !== courseId)
      setSelectedCourses(filtered)
      form.setValue("courses", filtered)
    }
  }

  const getSelectedCourseDetails = () => {
    return availableCourses.filter((item) => selectedCourses.includes(item.courseId)).map((item) => item.course)
  }

  const totalCredits = getSelectedCourseDetails().reduce((sum, course) => sum + course.credits, 0)

  const daysUntilDeadline = semester?.registrationDeadline
    ? Math.ceil((new Date(semester.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Registration Information</AlertTitle>
        <AlertDescription>
          You can register for courses until{" "}
          {semester.registrationDeadline
            ? new Date(semester.registrationDeadline).toLocaleDateString()
            : "the deadline"}
          .{daysUntilDeadline > 0 ? ` You have ${daysUntilDeadline} days remaining.` : " The deadline has passed."}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Select the courses you want to register for this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="courses"
                  render={() => (
                    <FormItem>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {availableCourses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No courses available</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              There are no courses available for registration this semester
                            </p>
                          </div>
                        ) : (
                          availableCourses.map((item) => (
                            <div key={item.courseId} className="flex items-center space-x-2 border p-3 rounded-md">
                              <Checkbox
                                id={item.courseId}
                                checked={selectedCourses.includes(item.courseId)}
                                onCheckedChange={(checked) => {
                                  handleCourseSelection(item.courseId, checked as boolean)
                                }}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={item.courseId}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {item.course.code}: {item.course.title}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {item.course.credits} Credit Hours | {item.course.department.name}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting || selectedCourses.length === 0}>
                  {isSubmitting ? "Submitting..." : "Register Courses"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Courses</CardTitle>
            <CardDescription>Review your selected courses before submitting</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No courses selected yet</p>
                <p className="text-xs text-muted-foreground mt-2">Select courses from the list on the left</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {getSelectedCourseDetails().map((course) => (
                    <div key={course.id} className="flex items-center justify-between border p-3 rounded-md">
                      <div>
                        <p className="text-sm font-medium">
                          {course.code}: {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{course.credits} Credit Hours</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleCourseSelection(course.id, false)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove course</span>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Total Courses:</p>
                    <p className="text-sm">{selectedCourses.length}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm font-medium">Total Credit Hours:</p>
                    <p className="text-sm">{totalCredits}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
