import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CourseStatsProps {
  data: {
    popularCourses: {
      course: string
      code: string
      department: string
      registrations: number
    }[]
    coursesByDepartment: {
      department: string
      courses: number
    }[]
    courseRegistrationStatus: {
      status: string
      count: number
    }[]
  }
}

export function CourseStats({ data }: CourseStatsProps) {
  const popularCourses = data?.popularCourses || []
  const coursesByDepartment = data?.coursesByDepartment || []
  const registrationStatus = data?.courseRegistrationStatus || []

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Courses</CardTitle>
            <CardDescription>Courses with the most registrations</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCourses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#8884d8" name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courses by Department</CardTitle>
            <CardDescription>Distribution of courses across departments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coursesByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="courses"
                  nameKey="department"
                  label={({ department, courses, percent }) =>
                    `${department}: ${courses} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {coursesByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Registration Status</CardTitle>
          <CardDescription>Status of course registrations</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={registrationStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Count">
                {registrationStatus.map((entry, index) => {
                  let color = "#8884d8"
                  if (entry.status === "APPROVED") color = "#82ca9d"
                  if (entry.status === "PENDING") color = "#ffc658"
                  if (entry.status === "REJECTED") color = "#ff8042"
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Courses</CardTitle>
          <CardDescription>Most popular courses by registration count</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Registrations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularCourses.map((course, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.course}</TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-primary/10">
                      {course.registrations}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {popularCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No course data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
