"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  department: string
  faculty: string
  maxCapacity: number
  currentEnrolled: number
}

interface Registration {
  id: string
  courseId: string
  courseCode: string
  courseTitle: string
  credits: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  registeredAt: string
}

const registrationFormSchema = z.object({
  semester: z.string({
    required_error: "Please select a semester",
  }),
  academicYear: z.string({
    required_error: "Please select an academic year",
  }),
})

type RegistrationFormValues = z.infer<typeof registrationFormSchema>

interface CourseRegistrationProps {
  userId: string
}

export function CourseRegistration({ userId }: CourseRegistrationProps) {
  const { toast } = useToast()
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      semester: "SEM1",
      academicYear: "2024-2025",
    },
  })

  // Fetch available courses and registrations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulate API calls
        // In a real app, these would be actual API calls
        setTimeout(() => {
          setAvailableCourses([
            {
              id: "1",
              code: "CSC101",
              title: "Introduction to Computer Science",
              credits: 3,
              department: "Computer Science",
              faculty: "Dr. John Doe",
              maxCapacity: 50,
              currentEnrolled: 30,
            },
            {
              id: "2",
              code: "CSC102",
              title: "Programming Fundamentals",
              credits: 4,
              department: "Computer Science",
              faculty: "Dr. Jane Smith",
              maxCapacity: 40,
              currentEnrolled: 25,
            },
            {
              id: "3",
              code: "MAT101",
              title: "Calculus I",
              credits: 3,
              department: "Mathematics",
              faculty: "Dr. Robert Johnson",
              maxCapacity: 60,
              currentEnrolled: 45,
            },
            {
              id: "4",
              code: "ENG101",
              title: "English Composition",
              credits: 3,
              department: "English",
              faculty: "Dr. Sarah Williams",
              maxCapacity: 30,
              currentEnrolled: 20,
            },
          ])

          setRegistrations([
            {
              id: "1",
              courseId: "1",
              courseCode: "CSC101",
              courseTitle: "Introduction to Computer Science",
              credits: 3,
              status: "APPROVED",
              registeredAt: "2023-09-01",
            },
            {
              id: "2",
              courseId: "2",
              courseCode: "CSC102",
              courseTitle: "Programming Fundamentals",
              credits: 4,
              status: "PENDING",
              registeredAt: "2023-09-01",
            },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const onSubmit = async (data: RegistrationFormValues) => {
    // This would be an API call in a real app
    console.log("Form submitted:", data)
    toast({
      title: "Success",
      description: "Semester and academic year updated successfully.",
    })
  }

  const registerForCourse = async (courseId: string) => {
    setIsRegistering(true)
    try {
      // Simulate API call
      setTimeout(() => {
        const course = availableCourses.find((c) => c.id === courseId)
        if (course) {
          const newRegistration: Registration = {
            id: Date.now().toString(),
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            credits: course.credits,
            status: "PENDING",
            registeredAt: new Date().toISOString(),
          }
          setRegistrations([...registrations, newRegistration])
          toast({
            title: "Course Registered",
            description: `You have successfully registered for ${course.code}: ${course.title}`,
          })
        }
        setIsRegistering(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register for the course. Please try again.",
        variant: "destructive",
      })
      setIsRegistering(false)
    }
  }

  const availableCoursesColumns: ColumnDef<Course>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "credits",
      header: "Credits",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "faculty",
      header: "Faculty",
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) => {
        const course = row.original
        const availability = `${course.currentEnrolled}/${course.maxCapacity}`
        const isFull = course.currentEnrolled >= course.maxCapacity
        return <span className={isFull ? "text-red-500" : "text-green-500"}>{availability}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original
        const isRegistered = registrations.some((r) => r.courseId === course.id)
        return (
          <Button
            variant="outline"
            size="sm"
            disabled={isRegistered || isRegistering}
            onClick={() => registerForCourse(course.id)}
          >
            {isRegistered ? "Registered" : "Register"}
          </Button>
        )
      },
    },
  ]

  const registrationsColumns: ColumnDef<Registration>[] = [
    {
      accessorKey: "courseCode",
      header: "Code",
    },
    {
      accessorKey: "courseTitle",
      header: "Title",
    },
    {
      accessorKey: "credits",
      header: "Credits",
    },
    {
      accessorKey: "registeredAt",
      header: "Registered At",
      cell: ({ row }) => {
        return new Date(row.original.registeredAt).toLocaleDateString()
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <div className="flex items-center">
            {status === "APPROVED" && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Approved</span>
              </>
            )}
            {status === "PENDING" && (
              <>
                <Clock className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-amber-500">Pending</span>
              </>
            )}
            {status === "REJECTED" && (
              <>
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500">Rejected</span>
              </>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const registration = row.original
        const canCancel = registration.status === "PENDING"
        return (
          <Button
            variant="outline"
            size="sm"
            disabled={!canCancel}
            onClick={() => {
              // Handle cancellation
              toast({
                title: "Registration Cancelled",
                description: `You have cancelled your registration for ${registration.courseCode}`,
              })
              setRegistrations(registrations.filter((r) => r.id !== registration.id))
            }}
          >
            {canCancel ? "Cancel" : "View"}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registration Period</CardTitle>
          <CardDescription>Select the semester and academic year for course registration</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SEM1">Semester 1</SelectItem>
                          <SelectItem value="SEM2">Semester 2</SelectItem>
                          <SelectItem value="SEM3">Semester 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2025-2026">2025-2026</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Update</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="registered">My Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>Courses available for registration in the selected semester</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={availableCoursesColumns} data={availableCourses} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registered" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Registrations</CardTitle>
              <CardDescription>Courses you have registered for</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={registrationsColumns} data={registrations} isLoading={isLoading} />
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Generate Registration Slip</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

