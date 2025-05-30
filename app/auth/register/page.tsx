"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CalendarIcon, ChevronLeft, Loader2 } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Create a conditional schema based on whether departments are available
const createRegisterSchema = (hasDepartments: boolean) => {
  const baseSchema = {
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    dateOfBirth: z.date({
      required_error: "Date of birth is required",
    }),
    gender: z.enum(["Male", "Female"], {
      required_error: "Please select your gender",
    }),
    nationality: z.string({
      required_error: "Please select your nationality",
    }),
    maritalStatus: z.enum(["Single", "Married", "Divorced", "Widow"], {
      required_error: "Please select your marital status",
    }),
    religion: z.string({
      required_error: "Please select your religion",
    }),
    church: z.string().optional(),
    responsibility: z.string().optional(),
    referralSource: z.string().optional(),
    physicallyDisabled: z.boolean().default(false),
    programId: z.string({
      required_error: "Please select a program",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  }

  // If departments are available, make departmentId required
  if (hasDepartments) {
    return z
      .object({
        ...baseSchema,
        departmentId: z.string({
          required_error: "Please select a department",
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
  }

  // If no departments are available, make departmentId optional
  return z
    .object({
      ...baseSchema,
      departmentId: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
}

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [programs, setPrograms] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true)
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [noDepartmentsForProgram, setNoDepartmentsForProgram] = useState(false)
  const [selectedProgramName, setSelectedProgramName] = useState<string>("")

  // Create schema based on whether departments are available
  const registerSchema = createRegisterSchema(!noDepartmentsForProgram)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      gender: undefined,
      nationality: "",
      maritalStatus: undefined,
      religion: "",
      church: "",
      responsibility: "",
      referralSource: "",
      physicallyDisabled: false,
      programId: "",
      departmentId: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Update form validation when noDepartmentsForProgram changes
  useEffect(() => {
    form.clearErrors("departmentId")
    // Force re-validation with the new schema
    form.trigger()
  }, [noDepartmentsForProgram, form])

  // Fetch programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoadingPrograms(true)
        setApiError(null)
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/programs`)

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data && Array.isArray(data)) {
          // Handle case where API returns an array directly
          setPrograms(data)
        } else if (data && data.success && Array.isArray(data.programs)) {
          // Handle case with success property
          setPrograms(data.programs)
        } else if (data && Array.isArray(data.data)) {
          // Handle case with data property
          setPrograms(data.data)
        } else {
          console.error("Failed to fetch programs:", data?.message || "Invalid response format")
          setApiError("Failed to load programs. Please try again later.")
          setPrograms([])
        }
      } catch (error) {
        console.error("Error fetching programs:", error)
        setApiError("Failed to load programs. Please try again later.")
        setPrograms([])
      } finally {
        setIsLoadingPrograms(false)
      }
    }

    fetchPrograms()
  }, [])

  // Fetch departments when program changes
  useEffect(() => {
    const programId = form.watch("programId")
    if (!programId) {
      setNoDepartmentsForProgram(false)
      return
    }

    // Update selected program name for display
    const selectedProgram = programs.find(p => p.id === programId)
    if (selectedProgram) {
      setSelectedProgramName(selectedProgram.name)
    }

    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true)
        setApiError(null)
        setNoDepartmentsForProgram(false)
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/departments/by-program/${programId}`,
        )

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        let departmentsData: any[] = []

        if (data && Array.isArray(data)) {
          departmentsData = data
        } else if (data && data.success && Array.isArray(data.departments)) {
          departmentsData = data.departments
        } else if (data && Array.isArray(data.data)) {
          departmentsData = data.data
        } else {
          console.error("Failed to fetch departments:", data?.message || "Invalid response format")
          departmentsData = []
        }

        setDepartments(departmentsData)
        
        // Check if there are no departments for this program
        if (departmentsData.length === 0) {
          setNoDepartmentsForProgram(true)
          // Clear department selection if there are no departments
          form.setValue("departmentId", "")
          
          toast({
            title: "No Departments Available",
            description: `There are no departments available for the selected program: ${selectedProgramName}. You can continue with your application.`,
            variant: "default",
          })
        } else {
          setNoDepartmentsForProgram(false)
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
        setApiError("Failed to load departments. Please try again later.")
        setDepartments([])
        setNoDepartmentsForProgram(true)
      } finally {
        setIsLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [form.watch("programId"), programs, form, toast])

  function nextStep() {
    const fieldsToValidate =
      step === 1
        ? ["firstName", "lastName", "email", "dateOfBirth", "gender", "nationality"]
        : step === 2
          ? noDepartmentsForProgram 
            ? ["programId", "maritalStatus", "religion"] // Skip departmentId validation if no departments
            : ["programId", "departmentId", "maritalStatus", "religion"]
          : ["password", "confirmPassword"]

    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setStep(step + 1)
      }
    })
  }

  function prevStep() {
    setStep(step - 1)
  }

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          role: "STUDENT",
          profileData: {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            nationality: data.nationality,
            maritalStatus: data.maritalStatus,
            religion: data.religion,
            church: data.church,
            responsibility: data.responsibility,
            referralSource: data.referralSource,
            physicallyDisabled: data.physicallyDisabled,
            programId: data.programId,
            departmentId: data.departmentId || null, // Handle case where departmentId is not required
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now login.",
      })

      router.push("/auth/login")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem with your registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a8a] text-white py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Bugema University Logo" width={50} height={50} className="rounded-full" />
            <div>
              <h1 className="text-xl font-bold">BUGEMA UNIVERSITY</h1>
              <p className="text-xs">Excellence in Service</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#1e3a8a] text-white p-4">
            <h2 className="text-xl font-bold text-center">ONLINE APPLICATION</h2>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 mx-6 mt-6">
              <span className="block sm:inline">{apiError}</span>
              <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setApiError(null)}>
                <span className="sr-only">Dismiss</span>
                <span className="text-xl">&times;</span>
              </button>
            </div>
          )}

          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <div className={`h-1 w-16 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <div className={`h-1 w-16 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                  <div className={`h-1 w-16 ${step >= 4 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    4
                  </div>
                </div>
                <div className="text-sm text-gray-500">Step {step} of 4</div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span>Personal Details</span>
                <span>Program Selection</span>
                <span>Account Setup</span>
                <span>Review & Submit</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              First Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your middle name (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Last Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>
                              Date of Birth <span className="text-red-500">*</span>
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-3 border rounded-md bg-white">
                                  <input
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    onChange={(e) => {
                                      const date = new Date(e.target.value)
                                      field.onChange(date)
                                    }}
                                    max={new Date().toISOString().split("T")[0]}
                                    min="1900-01-01"
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>
                              Gender <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-6"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Male" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Male</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Female" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Female</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nationality <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your nationality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="uganda">Uganda</SelectItem>
                                <SelectItem value="kenya">Kenya</SelectItem>
                                <SelectItem value="tanzania">Tanzania</SelectItem>
                                <SelectItem value="rwanda">Rwanda</SelectItem>
                                <SelectItem value="burundi">Burundi</SelectItem>
                                <SelectItem value="south-sudan">South Sudan</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Program Selection</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="programId"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>
                              Select Program <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                // Reset department when program changes
                                form.setValue("departmentId", "")
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a program" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingPrograms ? (
                                  <SelectItem value="loading" disabled>
                                    Loading programs...
                                  </SelectItem>
                                ) : programs.length > 0 ? (
                                  programs.map((program) => (
                                    <SelectItem key={program.id} value={program.id}>
                                      {program.name} ({program.code})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    No programs available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>Choose the academic program you wish to enroll in</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {noDepartmentsForProgram && form.watch("programId") && (
                        <div className="col-span-2">
                          <Alert variant="warning" className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800">No Departments Available</AlertTitle>
                            <AlertDescription className="text-amber-700">
                              There are no departments available for the selected program: <strong>{selectedProgramName}</strong>. 
                              You can continue with your application without selecting a department.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}

                      {!noDepartmentsForProgram && (
                        <FormField
                          control={form.control}
                          name="departmentId"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>
                                Select Department <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={!form.watch("programId") || isLoadingDepartments}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        !form.watch("programId")
                                          ? "Select a program first"
                                          : isLoadingDepartments
                                            ? "Loading departments..."
                                            : "Select a department"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {isLoadingDepartments ? (
                                    <SelectItem value="loading" disabled>
                                      Loading departments...
                                    </SelectItem>
                                  ) : departments.length > 0 ? (
                                    departments.map((department) => (
                                      <SelectItem key={department.id} value={department.id}>
                                        {department.name} ({department.code})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>
                                      {form.watch("programId")
                                        ? "No departments available for this program"
                                        : "Select a program first"}
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>Choose the department within your selected program</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Marital Status <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your marital status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Divorced">Divorced</SelectItem>
                                <SelectItem value="Widow">Widow</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="religion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Religion <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your religion" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="seventh-day-adventist">Seventh-day Adventist</SelectItem>
                                <SelectItem value="catholic">Catholic</SelectItem>
                                <SelectItem value="protestant">Protestant</SelectItem>
                                <SelectItem value="muslim">Muslim</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="church"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Church</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your church (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="responsibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your responsibility (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="elder">Elder</SelectItem>
                                <SelectItem value="deacon">Deacon</SelectItem>
                                <SelectItem value="deaconess">Deaconess</SelectItem>
                                <SelectItem value="youth-leader">Youth Leader</SelectItem>
                                <SelectItem value="choir-member">Choir Member</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="referralSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How did you know about Bugema University?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select how you heard about us" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="internet">Internet</SelectItem>
                                <SelectItem value="newspaper">Newspaper</SelectItem>
                                <SelectItem value="radio">Radio</SelectItem>
                                <SelectItem value="tv">TV</SelectItem>
                                <SelectItem value="school-visit">School Visit</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="physicallyDisabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => field.onChange(value === "yes")}
                                defaultValue={field.value ? "yes" : "no"}
                                className="flex gap-6"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="yes" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="no" />
                                  </FormControl>
                                  <FormLabel className="font-normal">No</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Physically Challenged</FormLabel>
                              <FormDescription>Do you have any physical disability?</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Account Setup</h3>

                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Password <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Confirm Password <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Review Your Information</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">First Name</p>
                          <p>{form.getValues("firstName")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Middle Name</p>
                          <p>{form.getValues("middleName") || "N/A"}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Last Name</p>
                          <p>{form.getValues("lastName")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p>{form.getValues("email")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                          <p>{form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth"), "PPP") : "N/A"}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          <p>{form.getValues("gender")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Nationality</p>
                          <p>{form.getValues("nationality")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Marital Status</p>
                          <p>{form.getValues("maritalStatus")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Religion</p>
                          <p>{form.getValues("religion")}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Church</p>
                          <p>{form.getValues("church") || "N/A"}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Program</p>
                          <p>
                            {programs.find((p) => p.id === form.getValues("programId"))?.name ||
                              form.getValues("programId")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Department</p>
                          <p>
                            {noDepartmentsForProgram 
                              ? "No department available for this program" 
                              : departments.find((d) => d.id === form.getValues("departmentId"))?.name ||
                                form.getValues("departmentId") || "N/A"}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Physically Disabled</p>
                          <p>{form.getValues("physicallyDisabled") ? "Yes" : "No"}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          By submitting this form, you confirm that all the information provided is accurate and
                          complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <Link href="/">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  )}

                  {step < 4 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <footer className="bg-[#1e3a8a] text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Bugema University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
