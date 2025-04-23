"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type Registration = {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  courseCode: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}

type ApprovalsClientProps = {
  pendingRegistrations: Registration[]
}

export function ApprovalsClient({ pendingRegistrations }: ApprovalsClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [registrations, setRegistrations] = useState<Registration[]>(pendingRegistrations || [])

  const handleApproval = async (id: string, approved: boolean) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }))

    try {
      const response = await fetch(`/api/approvals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: id,
          approved,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update registration status")
      }

      // Update the local state
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, status: approved ? "APPROVED" : "REJECTED" } : reg)),
      )

      toast({
        title: approved ? "Registration Approved" : "Registration Rejected",
        description: `The course registration has been ${approved ? "approved" : "rejected"} successfully.`,
        variant: approved ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error updating registration:", error)
      toast({
        title: "Error",
        description: "Failed to update registration status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
      router.refresh()
    }
  }

  // Group registrations by status
  const pendingRegs = registrations.filter((reg) => reg.status === "PENDING")
  const approvedRegs = registrations.filter((reg) => reg.status === "APPROVED")
  const rejectedRegs = registrations.filter((reg) => reg.status === "REJECTED")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending <Badge variant="outline">{pendingRegs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved <Badge variant="outline">{approvedRegs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected <Badge variant="outline">{rejectedRegs.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRegs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Pending Approvals</h3>
              <p className="text-muted-foreground">There are no pending course registrations to approve.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRegs.map((registration) => (
                <Card key={registration.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{registration.courseName}</CardTitle>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </div>
                    <CardDescription>Course Code: {registration.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Student:</span>
                        <span className="text-sm">{registration.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Requested:</span>
                        <span className="text-sm">{new Date(registration.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproval(registration.id, false)}
                      disabled={isLoading[registration.id]}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproval(registration.id, true)}
                      disabled={isLoading[registration.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedRegs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Approved Registrations</h3>
              <p className="text-muted-foreground">There are no approved course registrations yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedRegs.map((registration) => (
                <Card key={registration.id} className="overflow-hidden">
                  <CardHeader className="bg-green-50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{registration.courseName}</CardTitle>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    </div>
                    <CardDescription>Course Code: {registration.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Student:</span>
                        <span className="text-sm">{registration.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Approved on:</span>
                        <span className="text-sm">{new Date(registration.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRegs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <XCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Rejected Registrations</h3>
              <p className="text-muted-foreground">There are no rejected course registrations.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rejectedRegs.map((registration) => (
                <Card key={registration.id} className="overflow-hidden">
                  <CardHeader className="bg-red-50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{registration.courseName}</CardTitle>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Rejected
                      </Badge>
                    </div>
                    <CardDescription>Course Code: {registration.courseCode}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Student:</span>
                        <span className="text-sm">{registration.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Rejected on:</span>
                        <span className="text-sm">{new Date(registration.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
