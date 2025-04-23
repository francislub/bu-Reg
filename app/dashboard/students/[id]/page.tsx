"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  XCircle,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react"
import { getUserProfile } from "@/lib/actions/user-actions"
import { getStudentCourses } from "@/lib/actions/course-actions"
import { approveRegistration, rejectRegistration } from "@/lib/actions/registration-actions"

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [student, setStudent] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({})
  const [isRejecting, setIsRejecting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (
      !session ||
      (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")
    ) {
      router.push("/dashboard/students/$[id]")
      return
    }

    const fetchStudentData = async () => {
      setIsLoading(true)
      try {
        // Fetch student profile
        const profileResult = await getUserProfile(params.id)
        if (profileResult.success) {
          setStudent(profileResult.user)
        } else {
          toast({
            title: "Error",
            description: profileResult.message || "Failed to fetch student profile",
            variant: "destructive",
          })
        }

        // Fetch student courses
        const coursesResult = await getStudentCourses(params.id)
        if (coursesResult.success) {
          setCourses(coursesResult.courseUploads)
        } else {
          toast({
            title: "Error",
            description: coursesResult.message || "Failed to fetch student courses",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [session, router, params.id, toast])

  const handleApprove = async (registrationId: string) => {
    setIsApproving((prev) => ({ ...prev, [registrationId]: true }))
    try {
      const result = await approveRegistration(registrationId, session?.user.id || "")
      if (result.success) {
        toast({
          title: "Success",
          description: "Registration approved successfully",
        })

        // Refresh courses data
        const coursesResult = await getStudentCourses(params.id)
        if (coursesResult.success) {
          setCourses(coursesResult.courseUploads)
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving((prev) => ({ ...prev, [registrationId]: false }))
      router.refresh()
    }
  }

  const handleReject = async (registrationId: string) => {
    setIsRejecting((prev) => ({ ...prev, [registrationId]: true }))
    try {
      const result = await rejectRegistration(registrationId, session?.user.id || "")
      if (result.success) {
        toast({
          title: "Success",
          description: "Registration rejected successfully",
        })

        // Refresh courses data
        const coursesResult = await getStudentCourses(params.id)
        if (coursesResult.success) {
          setCourses(coursesResult.courseUploads)
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting((prev) => ({ ...prev, [registrationId]: false }))
      router.refresh()
    }
  }

  if (
    !session ||
    (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN")
  ) {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Student Details" text="View and manage student information">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : student ? (
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Student's personal details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" /> Full Name
                    </span>
                    <span className="text-base font-medium">
                      {student.profile?.firstName} {student.profile?.middleName} {student.profile?.lastName}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </span>
                    <span className="text-base">{student.email}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Date of Birth
                    </span>
                    <span className="text-base">
                      {student.profile?.dateOfBirth
                        ? new Date(student.profile.dateOfBirth).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" /> Student ID
                    </span>
                    <span className="text-base">{student.id}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-2" /> Nationality
                    </span>
                    <span className="text-base">{student.profile?.nationality || "Not specified"}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> Contact
                    </span>
                    <span className="text-base">{student.profile?.phone || "Not specified"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Courses the student is currently enrolled in.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length > 0 ? (
                      courses.map((courseUpload) => (
                        <TableRow key={courseUpload.id}>
                          <TableCell>{courseUpload.course.code}</TableCell>
                          <TableCell>{courseUpload.course.title}</TableCell>
                          <TableCell>{courseUpload.course.department.name}</TableCell>
                          <TableCell>{courseUpload.course.credits}</TableCell>
                          <TableCell>{courseUpload.semester.name}</TableCell>
                          <TableCell>
                            {courseUpload.status === "APPROVED" ? (
                              <Badge className="bg-green-100 text-green-800">Approved</Badge>
                            ) : courseUpload.status === "REJECTED" ? (
                              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No courses found for this student.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Registrations</CardTitle>
                <CardDescription>Manage student's course registration requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.length > 0 ? (
                      courses
                        .filter((c) => c.status === "PENDING")
                        .map((courseUpload) => (
                          <TableRow key={courseUpload.id}>
                            <TableCell>
                              {courseUpload.course.code} - {courseUpload.course.title}
                            </TableCell>
                            <TableCell>{courseUpload.semester.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            </TableCell>
                            <TableCell>{new Date(courseUpload.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApprove(courseUpload.id)}
                                  disabled={isApproving[courseUpload.id]}
                                >
                                  {isApproving[courseUpload.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(courseUpload.id)}
                                  disabled={isRejecting[courseUpload.id]}
                                >
                                  {isRejecting[courseUpload.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No registration requests found for this student.
                        </TableCell>
                      </TableRow>
                    )}
                    {courses.length > 0 && courses.filter((c) => c.status === "PENDING").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No pending registration requests for this student.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Student not found or you don't have permission to view this student.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}
