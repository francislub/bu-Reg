import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StudentEnrollmentReportProps {
  data: {
    enrollmentData: Array<{
      academicYearId: string
      academicYearName: string
      semesters: Array<{
        semesterId: string
        semesterName: string
        totalStudents: number
        newStudents: number
        returningStudents: number
      }>
    }>
    generatedAt: string
  }
}

export function StudentEnrollmentReport({ data }: StudentEnrollmentReportProps) {
  return (
    <div className="space-y-6">
      {data.enrollmentData.map((yearData) => (
        <Card key={yearData.academicYearId}>
          <CardHeader>
            <CardTitle>Enrollment for {yearData.academicYearName}</CardTitle>
            <CardDescription>Student enrollment statistics by semester</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Total Students</TableHead>
                  <TableHead className="text-right">New Students</TableHead>
                  <TableHead className="text-right">Returning Students</TableHead>
                  <TableHead className="text-right">New Student %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearData.semesters.map((semester) => (
                  <TableRow key={semester.semesterId}>
                    <TableCell className="font-medium">{semester.semesterName}</TableCell>
                    <TableCell className="text-right">{semester.totalStudents}</TableCell>
                    <TableCell className="text-right">{semester.newStudents}</TableCell>
                    <TableCell className="text-right">{semester.returningStudents}</TableCell>
                    <TableCell className="text-right">
                      {semester.totalStudents ? Math.round((semester.newStudents / semester.totalStudents) * 100) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
                {yearData.semesters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No enrollment data available for this academic year
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
      {data.enrollmentData.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No enrollment data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
