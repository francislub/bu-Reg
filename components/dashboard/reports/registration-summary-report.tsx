import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RegistrationSummaryReportProps {
  data: {
    semester: {
      id: string
      name: string
      academicYear: string
      startDate: string
      endDate: string
    }
    summary: {
      totalRegistrations: number
      approvedRegistrations: number
      pendingRegistrations: number
      rejectedRegistrations: number
    }
    courseStats: Array<{
      courseCode: string
      courseTitle: string
      department: string
      totalStudents: number
      approvedStudents: number
      pendingStudents: number
      rejectedStudents: number
    }>
    generatedAt: string
  }
}

export function RegistrationSummaryReport({ data }: RegistrationSummaryReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.approvedRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.summary.approvedRegistrations / data.summary.totalRegistrations) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.summary.pendingRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.summary.pendingRegistrations / data.summary.totalRegistrations) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.rejectedRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.summary.rejectedRegistrations / data.summary.totalRegistrations) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Registration Statistics</CardTitle>
          <CardDescription>
            Registration statistics for {data.semester.name}, {data.semester.academicYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Approved</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.courseStats.map((course, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{course.courseCode}</div>
                    <div className="text-sm text-muted-foreground">{course.courseTitle}</div>
                  </TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell className="text-right">{course.totalStudents}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {course.approvedStudents}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {course.pendingStudents}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {course.rejectedStudents}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {data.courseStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No course statistics available
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
