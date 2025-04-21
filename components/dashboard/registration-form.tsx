"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  courses: z.array(z.string()).min(1, {
    message: "You must select at least one course.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function RegistrationForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // This would come from the database in a real application
  const availableCourses = [
    {
      id: "cs101",
      code: "CS101",
      title: "Introduction to Computer Science",
      credits: 3,
      department: "Computer Science",
    },
    {
      id: "math201",
      code: "MATH201",
      title: "Calculus II",
      credits: 4,
      department: "Mathematics",
    },
    {
      id: "eng105",
      code: "ENG105",
      title: "Academic Writing",
      credits: 3,
      department: "English",
    },
    {
      id: "bus220",
      code: "BUS220",
      title: "Principles of Marketing",
      credits: 3,
      department: "Business Administration",
    },
    {
      id: "phys202",
      code: "PHYS202",
      title: "Electricity and Magnetism",
      credits: 4,
      department: "Physics",
    },
    {
      id: "cs205",
      code: "CS205",
      title: "Data Structures",
      credits: 3,
      department: "Computer Science",
    },
    {
      id: "hist101",
      code: "HIST101",
      title: "World History",
      credits: 3,
      department: "History",
    },
    {
      id: "chem201",
      code: "CHEM201",
      title: "Organic Chemistry",
      credits: 4,
      department: "Chemistry",
    },
  ]

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courses: [],
    },
  })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      // This would be an API call in a real application
      console.log("Form data:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Registration Submitted",
        description: "Your course registration has been submitted for approval.",
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was a problem with your registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Registration</CardTitle>
        <CardDescription>Select the courses you want to register for this semester.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="courses"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Available Courses</FormLabel>
                    <FormDescription>
                      Select the courses you wish to register for. You must select at least one course.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCourses.map((course) => (
                      <FormField
                        key={course.id}
                        control={form.control}
                        name="courses"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={course.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(course.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, course.id])
                                      : field.onChange(field.value?.filter((value) => value !== course.id))
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-base">
                                  {course.code}: {course.title}
                                </FormLabel>
                                <FormDescription>
                                  {course.credits} credits | {course.department}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
