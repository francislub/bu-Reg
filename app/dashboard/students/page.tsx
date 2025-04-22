"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Eye, Loader2, Search, Trash2, XCircle } from "lucide-react"
import { deleteUser, getAllUsers } from "@/lib/actions/user-actions"
import { approveRegistration, rejectRegistration } from "@/lib/actions/registration-actions"

export default function StudentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [studentRegistrations, setStudentRegistrations] = useState<Record<string, any[]>>({})

  useEffect(() => {
    if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
      router.push("/dashboard")
      return
    }

    const fetchStudents = async () => {
      setIsLoading(true)
      try {
        const result = await getAllUsers("STUDENT")
        if (result.success) {
          setStudents(result.users)
          setFilteredStudents(result.users)

          // Fetch registrations for each student
          const registrationsMap: Record<string, any[]> = {}
          for (const student of result.users) {
            const response = await fetch(`/api/student-registrations?studentId=${student.id}`)
            const data = await response.json()
            if (data.success) {
              registrationsMap[student.id] = data.registrations
            }
          }
          setStudentRegistrations(registrationsMap)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch students",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [session, router, toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          (student.profile &&
            (student.profile.firstName.toLowerCase().includes(query) ||
              student.profile.lastName.toLowerCase().includes(query))),
      )
      setFilteredStudents(filtered)
    }
  }, [searchQuery, students])

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`)
  }

  const handleDeleteStudent = async (studentId: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteUser(studentId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Student deleted successfully",
        })
        setStudents(students.filter((student) => student.id !== studentId))
        setFilteredStudents(filteredStudents.filter((student) => student.id !== studentId))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete student",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setStudentToDelete(null)
    }
  }

  const handleApproveRegistration = async (studentId: string, registrationId: string) => {
    setIsApproving(true)
    try {
      const result = await approveRegistration(registrationId, session?.user.id || "")
      if (result.success) {
        toast({
          title: "Success",
          description: "Registration approved successfully",
        })

        // Update the local state
        const response = await fetch(`/api/student-registrations?studentId=${studentId}`)
        const data = await response.json()
        if (data.success) {
          setStudentRegistrations({
            ...studentRegistrations,
            [studentId]: data.registrations,
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectRegistration = async (studentId: string, registrationId: string) => {
    setIsRejecting(true)
    try {
      const result = await rejectRegistration(registrationId, session?.user.id || "")
      if (result.success) {
        toast({
          title: "Success",
          description: "Registration rejected successfully",
        })

        // Update the local state
        const response = await fetch(`/api/student-registrations?studentId=${studentId}`)
        const data = await response.json()
        if (data.success) {
          setStudentRegistrations({
            ...studentRegistrations,
            [studentId]: data.registrations,
          })
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting registration:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const getPendingRegistrationsCount = (studentId: string) => {
    if (!studentRegistrations[studentId]) return 0
    return studentRegistrations[studentId].filter(
      (reg) => !reg.approvals || reg.approvals.length === 0 || reg.approvals[0].status === "PENDING",
    ).length
  }

  if (!session || (session.user.role !== "STAFF" && session.user.role !== "REGISTRAR")) {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Students" text="Manage university students."></DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>View and manage all university students.</CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Pending Registrations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const pendingCount = getPendingRegistrationsCount(student.id)
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.profile ? `${student.profile.firstName} ${student.profile.lastName}` : student.name}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.profile?.gender || "Not specified"}</TableCell>
                        <TableCell>{student.profile?.nationality || "Not specified"}</TableCell>
                        <TableCell>
                          {pendingCount > 0 ? (
                            <Badge className="bg-yellow-500">{pendingCount} pending</Badge>
                          ) : (
                            <Badge className="bg-green-500">None</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewStudent(student.id)}
                              title="View student details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pendingCount > 0 && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleViewStudent(student.id)}
                                  title="Approve registrations"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleViewStudent(student.id)}
                                  title="Reject registrations"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {session.user.role === "REGISTRAR" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setStudentToDelete(student.id)}
                                title="Delete student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {searchQuery ? "No students match your search." : "No students found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone and will remove all associated
              data including course registrations and attendance records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => studentToDelete && handleDeleteStudent(studentToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
