import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RegistrationSlipProps {
  data: {
    id: string
    user: {
      name: string
      email: string
      profile: {
        firstName: string
        middleName?: string
        lastName: string
        studentId?: string
        program?: string
      }
    }
    semester: {
      name: string
      academicYear: {
        name: string
      }
    }
    status: string
    createdAt: string
    courses: Array<{
      id: string
      course: {
        code: string
        title: string
        credits: number
        department: {
          name: string
        }
      }
      status: string
    }>
    registrationCard?: {
      cardNumber: string
      issuedDate: string
    }
  }
}

export function RegistrationSlip({ data }: RegistrationSlipProps) {
  const totalCredits = data.courses.reduce((total, course) => total + course.course.credits, 0)
  const fullName =
    `${data.user.profile.firstName} ${data.user.profile.middleName || ""} ${data.user.profile.lastName}`.trim()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Image src="/images/bugema.png" alt="Bugema University Logo" width={100} height={100} className="mx-auto" />
        </div>
        <h1 className="text-2xl font-bold">BUGEMA UNIVERSITY</h1>
        <p className="text-sm text-muted-foreground">
          A Chartered Seventh-Day Adventist Institution of Higher Learning
        </p>
        <h2 className="text-xl font-bold mt-4">OFFICIAL REGISTRATION SLIP</h2>
        <p className="text-sm">
          {data.semester.name}, {data.semester.academicYear.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Student Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student ID:</span>
                <span className="font-medium">{data.user.profile.studentId || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{data.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program:</span>
                <span className="font-medium">{data.user.profile.program || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Registration Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Date:</span>
                <span className="font-medium">{formatDate(data.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant="outline"
                  className={
                    data.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : data.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {data.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Card:</span>
                <span className="font-medium">
                  {data.registrationCard ? data.registrationCard.cardNumber : "Not Issued"}
                </span>
              </div>
              {data.registrationCard && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card Issue Date:</span>
                  <span className="font-medium">{formatDate(data.registrationCard.issuedDate)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Registered Courses</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.course.code}</TableCell>
                  <TableCell>{course.course.title}</TableCell>
                  <TableCell>{course.course.department.name}</TableCell>
                  <TableCell className="text-right">{course.course.credits}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        course.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : course.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Total Credits:
                </TableCell>
                <TableCell className="text-right font-bold">{totalCredits}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              This is an official registration slip from Bugema University.
            </p>
            <p className="text-sm text-muted-foreground">
              Printed on: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <div className="h-16 border-b border-dashed mb-1"></div>
            <p className="text-sm font-medium">Registrar's Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
