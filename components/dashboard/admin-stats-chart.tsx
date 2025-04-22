"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts"

interface EnrollmentData {
  semester: string
  students: number
  newStudents: number
  growthRate: number
}

interface DepartmentData {
  name: string
  students: number
}

interface PerformanceData {
  department: string
  gpa: number
  attendance: number
  passRate: number
}

export function AdminStatsChart() {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([])
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Colors for pie chart
  const COLORS = ["#8b5cf6", "#3b82f6", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b"]

  useEffect(() => {
    async function fetchEnrollmentData() {
      try {
        setIsLoading(true)
        // Fetch enrollment data from API
        const response = await fetch("/api/analytics/enrollment")

        if (!response.ok) {
          throw new Error("Failed to fetch enrollment data")
        }

        const data = await response.json()

        if (data.success) {
          setEnrollmentData(data.semesters)
        } else {
          throw new Error(data.message || "Failed to fetch enrollment data")
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error)
        setError("Failed to load enrollment data")
        // Fallback to empty data
        setEnrollmentData([])
      }
    }

    async function fetchDepartmentData() {
      try {
        // Fetch department data from API
        const response = await fetch("/api/analytics/departments")

        if (!response.ok) {
          throw new Error("Failed to fetch department data")
        }

        const data = await response.json()

        if (data.success) {
          setDepartmentData(data.departments)
        } else {
          throw new Error(data.message || "Failed to fetch department data")
        }
      } catch (error) {
        console.error("Error fetching department data:", error)
        // Fallback to empty data
        setDepartmentData([])
      }
    }

    async function fetchPerformanceData() {
      try {
        // Fetch performance data from API
        const response = await fetch("/api/analytics/performance")

        if (!response.ok) {
          throw new Error("Failed to fetch performance data")
        }

        const data = await response.json()

        if (data.success) {
          setPerformanceData(data.departments)
        } else {
          throw new Error(data.message || "Failed to fetch performance data")
        }
      } catch (error) {
        console.error("Error fetching performance data:", error)
        // Fallback to empty data
        setPerformanceData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollmentData()
    fetchDepartmentData()
    fetchPerformanceData()
  }, [])

  if (error) {
    return (
      <Card className="border-red-200 shadow-md">
        <CardHeader className="bg-red-50 rounded-t-lg">
          <CardTitle className="text-red-700">University Statistics</CardTitle>
          <CardDescription>Error loading statistics data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 text-center text-red-500">{error}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 shadow-md">
      <CardHeader className="bg-purple-50 rounded-t-lg">
        <CardTitle className="text-purple-700">University Statistics</CardTitle>
        <CardDescription>Overview of university enrollment and performance</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <Tabs defaultValue="enrollment">
            <TabsList className="mb-4">
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="enrollment">
              <div className="h-[300px]">
                {enrollmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                      <ChartTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="students" name="Students" fill="#8b5cf6" />
                      <Bar yAxisId="left" dataKey="newStudents" name="New Students" fill="#ec4899" />
                      <Line yAxisId="right" type="monotone" dataKey="growthRate" name="Growth (%)" stroke="#3b82f6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No enrollment data available
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="departments">
              <div className="h-[300px]">
                {departmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="students"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No department data available
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="performance">
              <div className="h-[300px]">
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                      <ChartTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="gpa" name="Avg. GPA" fill="#8b5cf6" />
                      <Bar yAxisId="left" dataKey="attendance" name="Attendance %" fill="#06b6d4" />
                      <Line yAxisId="right" type="monotone" dataKey="passRate" name="Pass Rate (%)" stroke="#3b82f6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No performance data available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
