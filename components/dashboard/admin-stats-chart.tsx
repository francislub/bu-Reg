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
  Tooltip,
  BarChart,
  Area,
  AreaChart
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

  // Colors for charts
  const COLORS = ["#8b5cf6", "#3b82f6", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b", "#ef4444", "#14b8a6"]
  const AREA_COLORS = ["#8b5cf6", "#3b82f6", "#ec4899"]

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
        // Fallback to sample data
        setEnrollmentData([
          { semester: "Fall 2023", students: 1200, newStudents: 450, growthRate: 5.2 },
          { semester: "Spring 2024", students: 1250, newStudents: 380, growthRate: 4.1 },
          { semester: "Summer 2024", students: 850, newStudents: 120, growthRate: -32.0 },
          { semester: "Fall 2024", students: 1320, newStudents: 470, growthRate: 55.3 },
          { semester: "Spring 2025", students: 1380, newStudents: 410, growthRate: 4.5 }
        ])
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
        // Fallback to sample data
        setDepartmentData([
          { name: "Computer Science", students: 320 },
          { name: "Business", students: 480 },
          { name: "Engineering", students: 280 },
          { name: "Medicine", students: 220 },
          { name: "Arts", students: 190 },
          { name: "Education", students: 150 }
        ])
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
          setPerformanceData(data.departments || [])
        } else {
          throw new Error(data.message || "Failed to fetch performance data")
        }
      } catch (error) {
        console.error("Error fetching performance data:", error)
        // Fallback to sample data
        setPerformanceData([
          { department: "Computer Science", gpa: 3.4, attendance: 88, passRate: 92 },
          { department: "Business", gpa: 3.2, attendance: 82, passRate: 88 },
          { department: "Engineering", gpa: 3.5, attendance: 90, passRate: 94 },
          { department: "Medicine", gpa: 3.7, attendance: 95, passRate: 96 },
          { department: "Arts", gpa: 3.3, attendance: 78, passRate: 86 },
          { department: "Education", gpa: 3.4, attendance: 85, passRate: 90 }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollmentData()
    fetchDepartmentData()
    fetchPerformanceData()
  }, [])

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3 backdrop-blur-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
    <div className="w-full h-full">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <Tabs defaultValue="enrollment" className="w-full">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrollment" className="mt-0">
            <div className="h-[300px]">
              {enrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorNewStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semester" tick={{ fill: '#64748b' }} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="students" name="Total Students" fill="url(#colorStudents)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="newStudents" name="New Students" fill="url(#colorNewStudents)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="growthRate" name="Growth (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No enrollment data available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="departments" className="mt-0">
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
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No department data available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-0">
            <div className="h-[300px]">
              {performanceData && performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" tick={{ fill: '#64748b' }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="attendance" name="Attendance %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="passRate" name="Pass Rate %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gpa" name="Avg. GPA (x25)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-0">
            <div className="h-[300px]">
              {enrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      {AREA_COLORS.map((color, index) => (
                        <linearGradient key={`colorGrad${index}`} id={`colorGrad${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semester" tick={{ fill: '#64748b' }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="students" name="Total Students" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGrad0)" />
                    <Area type="monotone" dataKey="newStudents" name="New Students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGrad1)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
