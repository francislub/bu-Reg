import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, Download, Filter, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Students | Bugema University",
  description: "Manage university students",
}

async function getStudents() {
  try {
    const students = await db.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return students
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to view students
  const { user } = session
  if (user.role !== "ADMIN" && user.role !== "REGISTRAR" && user.role !== "LECTURER") {
    redirect("/dashboard/students")
  }

  const students = await getStudents()

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage and view all students enrolled at Bugema University.</p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search students..." className="w-full pl-8 bg-background" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              {(user.role === "ADMIN" || user.role === "REGISTRAR") && (
                <Button size="sm" className="h-9">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-muted/50">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Program</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <GraduationCap className="h-8 w-8 mb-2" />
                            <p>No students found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={student.profile?.avatar || ""} alt={student.name} />
                                <AvatarFallback>{student.name?.substring(0, 2).toUpperCase() || "ST"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {student.profile?.firstName} {student.profile?.lastName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="font-mono text-xs">{student.profile?.studentId || "N/A"}</span>
                          </td>
                          <td className="p-4 align-middle">{student.email}</td>
                          <td className="p-4 align-middle">
                            <span className="text-sm">{student.profile?.program || "Not specified"}</span>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant="outline"
                              className={
                                student.profile?.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : student.profile?.status === "SUSPENDED"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }
                            >
                              {student.profile?.status || "PENDING"}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/dashboard/students/${student.id}`}>View</a>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{students.length}</strong> of <strong>{students.length}</strong> students
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
