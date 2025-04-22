import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Check, Clock, FileText, X } from "lucide-react"
import Link from "next/link"

export default async function CourseRegistrationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Get active semester
  const activeSemester = await db.semester.findFirst({
    where: { isActive: true },
  })

  if (!activeSemester) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Course Registration" text="Register for courses in the current semester." />
        <Card className="border-warning/20">
          <CardHeader className="bg-warning/5">
            <CardTitle className="text-warning flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              No Active Semester
            </CardTitle>
            <CardDescription>There is no active semester at the moment. Please check back later.</CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    )
  }

  // Check if registration deadline has passed
  const isRegistrationOpen = activeSemester.registrationDeadline
    ? new Date() < new Date(activeSemester.registrationDeadline)
    : true

  // Get user's registration for the active semester
  const registration = await db.registration.findFirst({
    where: {
      userId: session.user.id,
      semesterId: activeSemester.id,
    },
    include: {
      courseUploads: {
        include: {
          course: true,
          approvals: {
            include: {
              approver: true,
            },
          },
        },
      },
    },
  })

  // Get available courses for the semester
  const semesterCourses = await db.semesterCourse.findMany({
    where: {
      semesterId: activeSemester.id,
    },
    include: {
      course: {
        include: {
          department: true,
        },
      },
    },
  })

  // Group courses by department
  const coursesByDepartment = semesterCourses.reduce(
    (acc, sc) => {
      const deptName = sc.course.department.name
      if (!acc[deptName]) {
        acc[deptName] = []
      }
      acc[deptName].push(sc.course)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <DashboardShell>
      <DashboardHeader heading="Course Registration" text="Register for courses in the current semester.">
        {registration && (
          <Link href="/dashboard/registration/card">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>Registration Card</span>
            </Button>
          </Link>
        )}
      </DashboardHeader>

      {!registration ? (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Semester Registration
            </CardTitle>
            <CardDescription>
              You need to register for the {activeSemester.name} semester before you can select courses.
            </CardDescription>
          </CardHeader>
          <CardFooter className="bg-primary/5 border-t border-primary/10 flex justify-end">
            <Link href="/dashboard/semester-registration">
              <Button disabled={!isRegistrationOpen}>
                {isRegistrationOpen ? "Register Now" : "Registration Closed"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="registered" className="space-y-4">
          <TabsList>
            <TabsTrigger value="registered">Registered Courses</TabsTrigger>
            <TabsTrigger value="available">Available Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="registered" className="space-y-4">
            {registration.courseUploads.length > 0 ? (
              <div className="grid gap-4">
                {registration.courseUploads.map((upload) => (
                  <Card key={upload.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {upload.course.code}: {upload.course.title}
                          </CardTitle>
                          <CardDescription>{upload.course.credits} Credits</CardDescription>
                        </div>
                        <Badge
                          variant={
                            upload.status === "APPROVED"
                              ? "success"
                              : upload.status === "REJECTED"
                                ? "destructive"
                                : "outline"
                          }
                          className="ml-auto"
                        >
                          {upload.status === "APPROVED" && <Check className="mr-1 h-3 w-3" />}
                          {upload.status === "REJECTED" && <X className="mr-1 h-3 w-3" />}
                          {upload.status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                          {upload.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        {upload.course.description || "No description available"}
                      </p>
                    </CardContent>
                    {upload.approvals.length > 0 && (
                      <CardFooter className="border-t pt-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Approved by:</span>{" "}
                          {upload.approvals.map((a) => a.approver.name).join(", ")}
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-warning/20">
                <CardHeader className="bg-warning/5">
                  <CardTitle className="text-warning flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    No Courses Registered
                  </CardTitle>
                  <CardDescription>
                    You haven't registered for any courses yet. Please select courses from the Available Courses tab.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="available" className="space-y-6">
            {Object.entries(coursesByDepartment).map(([department, courses]) => (
              <div key={department} className="space-y-3">
                <h3 className="font-semibold text-lg">{department}</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => {
                    const isRegistered = registration.courseUploads.some((upload) => upload.courseId === course.id)

                    return (
                      <Card key={course.id} className={`overflow-hidden ${isRegistered ? "border-primary/20" : ""}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {course.code}: {course.title}
                          </CardTitle>
                          <CardDescription>{course.credits} Credits</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {course.description || "No description available"}
                          </p>
                        </CardContent>
                        <CardFooter className="border-t pt-2">
                          {isRegistered ? (
                            <Badge variant="outline" className="bg-primary/10">
                              <Check className="mr-1 h-3 w-3" />
                              Registered
                            </Badge>
                          ) : (
                            <Button size="sm" disabled={!isRegistrationOpen} className="w-full">
                              Register for Course
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </DashboardShell>
  )
}
