"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardBarChart } from "./charts/bar-chart"
import { DashboardPieChart } from "./charts/pie-chart"
import { DashboardLineChart } from "./charts/line-chart"

export function StaffAnalytics({ departmentId, departmentName }: { departmentId: string; departmentName: string }) {
  const [selectedSemester, setSelectedSemester] = useState("current")

  // Mock data for analytics
  const studentEnrollmentData = [
    { year: "First Year", count: 85 },
    { year: "Second Year", count: 72 },
    { year: "Third Year", count: 64 },
    { year: "Fourth Year", count: 53 },
  ]

  const coursePopularityData = [
    { course: "CS101", registrations: 45 },
    { course: "CS201", registrations: 38 },
    { course: "CS301", registrations: 32 },
    { course: "CS401", registrations: 28 },
    { course: "CS501", registrations: 22 },
  ]

  const approvalRatesData = [
    { name: "Approved", value: 78, color: "#4ade80" },
    { name: "Pending", value: 15, color: "#facc15" },
    { name: "Rejected", value: 7, color: "#f87171" },
  ]

  const registrationTrendsData = [
    { day: "Week 1", registrations: 12 },
    { day: "Week 2", registrations: 28 },
    { day: "Week 3", registrations: 45 },
    { day: "Week 4", registrations: 32 },
    { day: "Week 5", registrations: 18 },
    { day: "Week 6", registrations: 8 },
  ]

  const genderDistributionData = [
    { name: "Male", value: 58, color: "#60a5fa" },
    { name: "Female", value: 42, color: "#f472b6" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Semester</SelectItem>
            <SelectItem value="previous">Previous Semester</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Enrollment by Year</CardTitle>
                <CardDescription>Distribution of students across academic years</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardBarChart
                  data={studentEnrollmentData}
                  xAxisKey="year"
                  bars={[
                    {
                      dataKey: "count",
                      name: "Students",
                      color: "#8b5cf6",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Distribution of students by gender</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardPieChart data={genderDistributionData} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
              <CardDescription>Student enrollment trends over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <DashboardLineChart
                data={[
                  { semester: "Fall 2023", students: 220 },
                  { semester: "Spring 2024", students: 245 },
                  { semester: "Summer 2024", students: 180 },
                  { semester: "Fall 2024", students: 265 },
                  { semester: "Spring 2025", students: 274 },
                ]}
                xAxisKey="semester"
                lines={[
                  {
                    dataKey: "students",
                    name: "Students",
                    color: "#06b6d4",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Popularity</CardTitle>
                <CardDescription>Most popular courses by registration</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardBarChart
                  data={coursePopularityData}
                  xAxisKey="course"
                  bars={[
                    {
                      dataKey: "registrations",
                      name: "Registrations",
                      color: "#10b981",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
                <CardDescription>Course registration trends over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardLineChart
                  data={registrationTrendsData}
                  xAxisKey="day"
                  lines={[
                    {
                      dataKey: "registrations",
                      name: "Registrations",
                      color: "#f97316",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Approval Rates</CardTitle>
              <CardDescription>Distribution of course approval statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <DashboardPieChart data={approvalRatesData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Approval Efficiency</CardTitle>
                <CardDescription>Average time to approve course registrations</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardBarChart
                  data={[
                    { staff: "John Doe", days: 1.2 },
                    { staff: "Jane Smith", days: 0.8 },
                    { staff: "Bob Johnson", days: 1.5 },
                    { staff: "Alice Williams", days: 0.9 },
                    { staff: "Department Average", days: 1.1 },
                  ]}
                  xAxisKey="staff"
                  bars={[
                    {
                      dataKey: "days",
                      name: "Average Days",
                      color: "#ec4899",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Workload</CardTitle>
                <CardDescription>Distribution of approval workload among staff</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <DashboardPieChart
                  data={[
                    { name: "John Doe", value: 32, color: "#60a5fa" },
                    { name: "Jane Smith", value: 28, color: "#34d399" },
                    { name: "Bob Johnson", value: 24, color: "#a78bfa" },
                    { name: "Alice Williams", value: 16, color: "#f87171" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Comparison with other departments</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <DashboardBarChart
                data={[
                  { metric: "Approval Rate", [departmentName]: 92, "University Average": 85 },
                  { metric: "Response Time", [departmentName]: 1.1, "University Average": 1.8 },
                  { metric: "Student Satisfaction", [departmentName]: 4.2, "University Average": 3.8 },
                  { metric: "Course Completion", [departmentName]: 94, "University Average": 88 },
                ]}
                xAxisKey="metric"
                bars={[
                  {
                    dataKey: departmentName,
                    name: departmentName,
                    color: "#3b82f6",
                  },
                  {
                    dataKey: "University Average",
                    name: "University Average",
                    color: "#94a3b8",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
