import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CoursePopularityReportProps {
  data: {
    semester: {
      id: string
      name: string
      academicYear: string
    }
    coursePopularity: Array<{
      courseId: string
      courseCode: string
      courseTitle: string
      department: string
      totalRegistrations: number
      approvedRegistrations: number
      pendingRegistrations: number
      rejectedRegistrations: number
    }>
    generatedAt: string
  }
}

export function CoursePopularityReport({ data }: CoursePopularityReportProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Popularity Ranking</CardTitle>
          <CardDescription>
            Courses ranked by popularity for {data.semester.name}, {data.semester.academicYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total Registrations</TableHead>
                <TableHead className="text-right">Status Breakdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.coursePopularity.map((course, index) => (
                <TableRow key={course.courseId}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{course.courseCode}</div>
                    <div className="text-sm text-muted-foreground">{course.courseTitle}</div>
                  </TableCell>
                  <TableCell>{course.department}</TableCell>
                  <TableCell className="text-right font-bold">{course.totalRegistrations}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {course.approvedRegistrations} Approved
                      </Badge>
                      {course.pendingRegistrations > 0 && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {course.pendingRegistrations} Pending
                        </Badge>
                      )}
                      {course.rejectedRegistrations > 0 && (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {course.rejectedRegistrations} Rejected
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.coursePopularity.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No course popularity data available
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
