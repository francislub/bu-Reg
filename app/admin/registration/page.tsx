"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, Search, CheckCircle, XCircle } from "lucide-react"

// Mock data
const registrations = [
  {
    id: "1",
    student: "John Doe",
    studentId: "2023001",
    course: "CS101: Introduction to Computer Science",
    courseId: "CS101",
    status: "PENDING",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    registeredAt: "2023-08-15T10:30:00Z",
  },
  {
    id: "2",
    student: "Jane Smith",
    studentId: "2023002",
    course: "EE201: Digital Electronics",
    courseId: "EE201",
    status: "APPROVED",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    registeredAt: "2023-08-14T09:15:00Z",
  },
  {
    id: "3",
    student: "Michael Johnson",
    studentId: "2023003",
    course: "BA301: Marketing Management",
    courseId: "BA301",
    status: "REJECTED",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    registeredAt: "2023-08-16T14:45:00Z",
  },
  {
    id: "4",
    student: "Emily Davis",
    studentId: "2023004",
    course: "MED401: Human Anatomy",
    courseId: "MED401",
    status: "APPROVED",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    registeredAt: "2023-08-13T11:20:00Z",
  },
  {
    id: "5",
    student: "Robert Wilson",
    studentId: "2023005",
    course: "PHY201: Classical Mechanics",
    courseId: "PHY201",
    status: "PENDING",
    semester: "Fall 2023",
    academicYear: "2023-2024",
    registeredAt: "2023-08-17T13:10:00Z",
  },
]

export default function RegistrationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredRegistrations = registrations.filter(
    (reg) =>
      (reg.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.courseId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "all" ||
        (activeTab === "pending" && reg.status === "PENDING") ||
        (activeTab === "approved" && reg.status === "APPROVED") ||
        (activeTab === "rejected" && reg.status === "REJECTED")),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pending
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Course Registrations</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search registrations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Semester</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reg.student}</div>
                            <div className="text-sm text-muted-foreground">{reg.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{reg.course}</TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <div>{reg.semester}</div>
                            <div className="text-sm text-muted-foreground">{reg.academicYear}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(reg.registeredAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              {reg.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem className="text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No registrations found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Semester</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reg.student}</div>
                            <div className="text-sm text-muted-foreground">{reg.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{reg.course}</TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <div>{reg.semester}</div>
                            <div className="text-sm text-muted-foreground">{reg.academicYear}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(reg.registeredAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No pending registrations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Semester</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reg.student}</div>
                            <div className="text-sm text-muted-foreground">{reg.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{reg.course}</TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <div>{reg.semester}</div>
                            <div className="text-sm text-muted-foreground">{reg.academicYear}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(reg.registeredAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No approved registrations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Semester</TableHead>
                    <TableHead className="hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reg.student}</div>
                            <div className="text-sm text-muted-foreground">{reg.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{reg.course}</TableCell>
                        <TableCell>{getStatusBadge(reg.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <div>{reg.semester}</div>
                            <div className="text-sm text-muted-foreground">{reg.academicYear}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(reg.registeredAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No rejected registrations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

