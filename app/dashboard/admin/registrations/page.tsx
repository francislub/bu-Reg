import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationApprovalForm } from "@/components/dashboard/registration-approval-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminRegistrationsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  // Get all registrations
  const pendingRegistrations = await prisma.registration.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        include: {
          student: true,
        },
      },
      course: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const approvedRegistrations = await prisma.registration.findMany({
    where: { status: "APPROVED" },
    include: {
      user: {
        include: {
          student: true,
        },
      },
      course: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const rejectedRegistrations = await prisma.registration.findMany({
    where: { status: "REJECTED" },
    include: {
      user: {
        include: {
          student: true,
        },
      },
      course: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Registrations</h1>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRegistrations.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Registrations</CardTitle>
              <CardDescription>Review and approve student course registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationApprovalForm registrations={pendingRegistrations} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Registrations</CardTitle>
              <CardDescription>Recently approved course registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                  <div>Student</div>
                  <div>Course Code</div>
                  <div className="col-span-2">Title</div>
                  <div>Date</div>
                </div>
                <div className="divide-y">
                  {approvedRegistrations.map((registration) => (
                    <div key={registration.id} className="grid grid-cols-5 gap-4 p-4">
                      <div>
                        {registration.user.student?.firstName} {registration.user.student?.lastName}
                      </div>
                      <div>{registration.course.courseCode}</div>
                      <div className="col-span-2">{registration.course.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(registration.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Registrations</CardTitle>
              <CardDescription>Recently rejected course registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                  <div>Student</div>
                  <div>Course Code</div>
                  <div className="col-span-2">Title</div>
                  <div>Date</div>
                </div>
                <div className="divide-y">
                  {rejectedRegistrations.map((registration) => (
                    <div key={registration.id} className="grid grid-cols-5 gap-4 p-4">
                      <div>
                        {registration.user.student?.firstName} {registration.user.student?.lastName}
                      </div>
                      <div>{registration.course.courseCode}</div>
                      <div className="col-span-2">{registration.course.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(registration.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

