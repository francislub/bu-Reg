"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, BookOpen, GraduationCap, School } from "lucide-react"
import { SystemOverview } from "@/components/dashboard/system-overview"
import { RegistrationTrends } from "@/components/dashboard/registration-trends"
import { DepartmentStats } from "@/components/dashboard/department-stats"
import { CourseStats } from "@/components/dashboard/course-stats"

export default function SystemStatsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  // Check if user is authorized (only REGISTRAR or ADMIN)
  useEffect(() => {
    if (session && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchSystemStats = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/analytics/system-stats")
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(data.stats)
          } else {
            toast({
              title: "Error",
              description: data.message || "Failed to fetch system statistics",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch system statistics",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching system statistics:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "REGISTRAR" || session?.user?.role === "ADMIN") {
      fetchSystemStats()
    }
  }, [session, toast])

  if (session && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="System Statistics" text="View comprehensive system statistics and analytics" />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.activeStudents || 0} active students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeCourses || 0} active courses this semester
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPrograms || 0}</div>
                <p className="text-xs text-muted-foreground">Across {stats?.totalDepartments || 0} departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.currentRegistrations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.approvedRegistrations || 0} approved this semester
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="registrations">Registration Trends</TabsTrigger>
              <TabsTrigger value="departments">Department Statistics</TabsTrigger>
              <TabsTrigger value="courses">Course Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <SystemOverview data={stats} />
            </TabsContent>
            <TabsContent value="registrations" className="space-y-4">
              <RegistrationTrends data={stats} />
            </TabsContent>
            <TabsContent value="departments" className="space-y-4">
              <DepartmentStats data={stats} />
            </TabsContent>
            <TabsContent value="courses" className="space-y-4">
              <CourseStats data={stats} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardShell>
  )
}
