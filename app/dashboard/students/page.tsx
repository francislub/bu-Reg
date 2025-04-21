"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Eye, FileEdit, Trash2, Search, Loader2 } from "lucide-react"
import { deleteUser } from "@/lib/actions/user-actions"

export default function StudentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (session && session.user.role !== "STAFF" && session.user.role !== "REGISTRAR") {
      router.push("/dashboard")
    }

    const fetchStudents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/students")
        const data = await response.json()
        if (data.success) {
          setStudents(data.students)
          setFilteredStudents(data.students)
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch students",
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

    if (session) {
      fetchStudents()
    }
  }, [session, router, toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(
        (student) =>
          (student.profile?.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (student.profile?.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (student.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  async function handleDeleteStudent(studentId: string) {
    setIsDeleting(true)
    try {
      const result = await deleteUser(studentId)
      if (result.success) {
        toast({
          title: "Student Deleted",
          description: "Student account has been deleted successfully.",
        })

        // Update local state
        setStudents(students.filter((student) => student.id !== studentId))
        setFilteredStudents(filteredStudents.filter((student) => student.id !== studentId))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete student account. Please try again.",
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

  if (session && session.user.role !== "STAFF" && session.user.role !== "REGISTRAR") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Students" text="View and manage all university students." />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Student List</CardTitle>
              <CardDescription>All registered students in the university.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="w-full md:w-[300px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Status</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.profile ? `${student.profile.firstName} ${student.profile.lastName}` : student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.registrations && student.registrations.length > 0 ? (
                          <Badge
                            variant={
                              student.registrations[0].status === "APPROVED"
                                ? "success"
                                : student.registrations[0].status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {student.registrations[0].status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Registered</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.registrations && student.registrations.length > 0
                          ? student.registrations[0].semester.name
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/students/${student.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {session?.user.role === "REGISTRAR" && (
                            <>
                              <Button variant="ghost" size="icon">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setStudentToDelete(student.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {searchTerm ? "No students match your search." : "No students found."}
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
              Are you sure you want to delete this student? This action cannot be undone.
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
