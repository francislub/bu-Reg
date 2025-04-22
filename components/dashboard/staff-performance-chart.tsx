"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface StaffPerformanceChartProps {
  userId: string
}

interface AttendanceData {
  course: string
  present: number
  absent: number
  total: number
  rate: number
}

interface PerformanceData {
  course: string
  average: number
  highest: number
  passRate: number
}

export function StaffPerformanceChart({ userId }: StaffPerformanceChartProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        setIsLoading(true)
        // Fetch attendance data from API
        const response = await fetch(`/api/analytics/attendance?lecturerId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data")
        }

        const data = await response.json()

        if (data.success) {
          // Transform API data into chart format
          const chartData = data.courses.map((course: any) => ({
            course: course.code,
            present: course.presentCount,
            absent: course.absentCount,
            total: course.totalCount,
            rate: course.presentCount > 0 ? Math.round((course.presentCount / course.totalCount) * 100 * 10) / 10 : 0,
          }))

          setAttendanceData(chartData)
        } else {
          throw new Error(data.message || "Failed to fetch attendance data")
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        setError("Failed to load attendance data")
        // Fallback to empty data
        setAttendanceData([])
      }
    }

    async function fetchPerformanceData() {
      try {
        // Fetch performance data from API
        const response = await fetch(`/api/analytics/grades?lecturerId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch performance data")
        }

        const data = await response.json()

        if (data.success) {
          // Transform API data into chart format
          const chartData = data.courses.map((course: any) => ({
            course: course.code,
            average: course.averageGrade,
            highest: course.highestGrade,
            passRate: course.passRate,
          }))

          setPerformanceData(chartData)
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

    fetchAttendanceData()
    fetchPerformanceData()
  }, [userId])

  if (error) {
    return (
      <Card className="border-red-200 shadow-md">
        <CardHeader className="bg-red-50 rounded-t-lg">
          <CardTitle className="text-red-700">Course Performance</CardTitle>
          <CardDescription>Error loading performance data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 text-center text-red-500">{error}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Course Performance</CardTitle>
        <CardDescription>Student attendance and performance in your courses</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <Tabs defaultValue="attendance">
            <TabsList className="mb-4">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="attendance">
              <div className="h-[300px]">
                {attendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="course" />
                      <YAxis yAxisId="left" orientation="left" stroke="#16a34a" />
                      <YAxis yAxisId="right" orientation="right" stroke="#2563eb" />
                      <ChartTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="present" name="Present" fill="#16a34a" />
                      <Bar yAxisId="left" dataKey="absent" name="Absent" fill="#ef4444" />
                      <Line yAxisId="right" type="monotone" dataKey="rate" name="Rate (%)" stroke="#2563eb" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No attendance data available
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
                      <XAxis dataKey="course" />
                      <YAxis yAxisId="left" orientation="left" stroke="#16a34a" />
                      <YAxis yAxisId="right" orientation="right" stroke="#2563eb" />
                      <ChartTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="average" name="Class Average" fill="#16a34a" />
                      <Bar yAxisId="left" dataKey="highest" name="Highest Score" fill="#2563eb" />
                      <Line yAxisId="right" type="monotone" dataKey="passRate" name="Pass Rate (%)" stroke="#8884d8" />
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
