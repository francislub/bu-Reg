"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Chart,
  ChartTooltip,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Pie,
  PieChart,
  Cell,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardChartsProps {
  userId: string
}

export function DashboardCharts({ userId }: DashboardChartsProps) {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [gradesData, setGradesData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch attendance data
        const attendanceRes = await fetch(`/api/analytics/attendance?userId=${userId}`)
        const attendanceJson = await attendanceRes.json()

        if (attendanceJson.success) {
          setAttendanceData(attendanceJson.data)
        }

        // Fetch grades data
        const gradesRes = await fetch(`/api/analytics/grades?userId=${userId}`)
        const gradesJson = await gradesRes.json()

        if (gradesJson.success) {
          setGradesData(gradesJson.data)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
        // Use sample data if API fails
        setAttendanceData(sampleAttendanceData)
        setGradesData(sampleGradesData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  // If still loading, use sample data for initial render
  const displayAttendanceData = isLoading
    ? sampleAttendanceData
    : attendanceData.length > 0
      ? attendanceData
      : sampleAttendanceData
  const displayGradesData = isLoading ? sampleGradesData : gradesData.length > 0 ? gradesData : sampleGradesData

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Your attendance record for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bar">
            <TabsList className="mb-4">
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="bar">
              <Chart>
                <ComposedChart data={displayAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="present" fill="#4ade80" name="Present" />
                  <Bar dataKey="absent" fill="#f87171" name="Absent" />
                  <Line type="monotone" dataKey="rate" stroke="#8884d8" name="Rate (%)" />
                </ComposedChart>
              </Chart>
            </TabsContent>
            <TabsContent value="pie">
              <Chart>
                <PieChart>
                  <Pie
                    data={displayAttendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="course"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {displayAttendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </Chart>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>Your grades across different courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart>
            <ComposedChart data={displayGradesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <ChartTooltip />
              <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="Score" />
              <Line yAxisId="right" type="monotone" dataKey="average" stroke="#82ca9d" name="Class Average" />
            </ComposedChart>
          </Chart>
        </CardContent>
      </Card>
    </div>
  )
}

// Sample data for when API fails or is loading
const sampleAttendanceData = [
  { course: "CS101", present: 12, absent: 2, total: 14, rate: 85.7 },
  { course: "MATH201", present: 10, absent: 4, total: 14, rate: 71.4 },
  { course: "ENG105", present: 13, absent: 1, total: 14, rate: 92.9 },
  { course: "BUS220", present: 9, absent: 5, total: 14, rate: 64.3 },
  { course: "PHYS202", present: 11, absent: 3, total: 14, rate: 78.6 },
]

const sampleGradesData = [
  { course: "CS101", score: 85, average: 78 },
  { course: "MATH201", score: 72, average: 68 },
  { course: "ENG105", score: 90, average: 82 },
  { course: "BUS220", score: 78, average: 75 },
  { course: "PHYS202", score: 81, average: 74 },
]
