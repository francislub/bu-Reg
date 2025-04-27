import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DepartmentStatsProps {
  data: {
    departmentStats: {
      department: string
      students: number
      courses: number
      registrations: number
    }[]
    departmentGrowth: {
      department: string
      previousPeriod: number
      currentPeriod: number
      growthRate: number
    }[]
  }
}

export function DepartmentStats({ data }: DepartmentStatsProps) {
  const departmentData = data?.departmentStats || []
  const growthData = data?.departmentGrowth || []

  // Colors for the bars
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Department Statistics</CardTitle>
          <CardDescription>Key metrics by department</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#8884d8" name="Students" />
              <Bar dataKey="courses" fill="#82ca9d" name="Courses" />
              <Bar dataKey="registrations" fill="#ffc658" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Growth</CardTitle>
            <CardDescription>Student growth rate by department</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="growthRate" name="Growth Rate (%)">
                  {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.growthRate >= 0 ? "#82ca9d" : "#ff8042"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>Detailed statistics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Courses</TableHead>
                  <TableHead className="text-right">Registrations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentData.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell className="text-right">{dept.students}</TableCell>
                    <TableCell className="text-right">{dept.courses}</TableCell>
                    <TableCell className="text-right">{dept.registrations}</TableCell>
                  </TableRow>
                ))}
                {departmentData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No department data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
