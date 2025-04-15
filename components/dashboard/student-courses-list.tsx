"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { StatsCard } from "@/components/dashboard/stats-card"

export function StudentCoursesList({ userId, courses }: { userId: string; courses: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const handleRemoveCourse = async (courseId: string) => {
    setIsRemoving(courseId)
    try {
      // Call API to remove course
      const response = await fetch(`/api/course-uploads/${courseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to remove course")
      }

      toast({
        title: "Course removed",
        description: "The course has been removed from your registration",
        variant: "default",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove the course",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(null)
    }
  }

  const approvedCourses = courses.filter((course) => course.status === "APPROVED")
  const pendingCourses = courses.filter((course) => course.status === "PENDING")
  const totalCredits = courses.reduce((sum, course) => sum + course.course.credits, 0)
  const approvedCredits = approvedCourses.reduce((sum, course) => sum + course.course.credits, 0)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Courses"
          value={courses.length}
          description={`${totalCredits} Total Credit Hours`}
          icon={BookOpen}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Approved Courses"
          value={approvedCourses.length}
          description={`${approvedCredits} Credit Hours`}
          icon={Check}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Pending Courses"
          value={pendingCourses.length}
          description="Awaiting approval"
          icon={Clock}
          iconColor="text-yellow-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Courses</CardTitle>
          <CardDescription>Manage your course registrations for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No courses registered</p>
                  <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/register-courses")}>
                    Register Courses
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRemove={handleRemoveCourse}
                      isRemoving={isRemoving === course.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
              {approvedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Check className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No approved courses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRemove={handleRemoveCourse}
                      isRemoving={isRemoving === course.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              {pendingCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending courses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRemove={handleRemoveCourse}
                      isRemoving={isRemoving === course.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}

function CourseCard({
  course,
  onRemove,
  isRemoving,
}: {
  course: any
  onRemove: (id: string) => void
  isRemoving: boolean
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1 mb-4 md:mb-0">
        <div className="flex items-center">
          <h3 className="text-sm font-medium">
            {course.course.code}: {course.course.title}
          </h3>
          <Badge variant={course.status === "APPROVED" ? "default" : "secondary"} className="ml-2">
            {course.status === "APPROVED" ? "Approved" : "Pending"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {course.course.credits} Credit Hours | {course.course.department.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Registered on: {new Date(course.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex space-x-2">
        {course.status === "PENDING" && (
          <Button variant="destructive" size="sm" onClick={() => onRemove(course.id)} disabled={isRemoving}>
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        )}
      </div>
    </div>
  )
}
