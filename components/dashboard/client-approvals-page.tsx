"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { approveCourseUpload, rejectCourseUpload } from "@/lib/actions/course-registration-actions"

export default function ClientApprovalsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [isRejecting, setIsRejecting] = useState<string | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchApprovals()
  }, [session])

  const fetchApprovals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/approvals")
      const data = await response.json()

      if (data.success) {
        setPendingApprovals(data.approvals || [])
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch approvals",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching approvals:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchApprovals()
    setIsRefreshing(false)
  }

  const handleApprove = async (id: string) => {
    try {
      setIsApproving(id)
      const result = await approveCourseUpload(id)

      if (result.success) {
        toast({
          title: "Approved",
          description: "The course registration has been approved.",
        })
        // Remove the approved item from the list
        setPendingApprovals(pendingApprovals.filter((approval) => approval.id !== id))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to approve course registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(null)
    }
  }

  const openRejectDialog = (id: string) => {
    setSelectedApprovalId(id)
    setRejectionReason("")
    setShowRejectDialog(true)
  }

  const handleReject = async () => {
    if (!selectedApprovalId) return

    try {
      setIsRejecting(selectedApprovalId)
      const result = await rejectCourseUpload(selectedApprovalId, rejectionReason)

      if (result.success) {
        toast({
          title: "Rejected",
          description: "The course registration has been rejected.",
        })
        // Remove the rejected item from the list
        setPendingApprovals(pendingApprovals.filter((approval) => approval.id !== selectedApprovalId))
        setShowRejectDialog(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reject course registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(null)
    }
  }

  // Filter approvals based on search term
  const filteredApprovals = pendingApprovals.filter(
    (approval) =>
      approval.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.registration?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.registration?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Registration Approvals</CardTitle>
              <CardDescription>Approve or reject pending course registrations</CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by course code, name, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingApprovals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {approval.registration?.user?.profile?.firstName}{" "}
                          {approval.registration?.user?.profile?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{approval.registration?.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{approval.course?.code}</TableCell>
                    <TableCell>{approval.course?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{approval.course?.department?.name}</Badge>
                    </TableCell>
                    <TableCell>{approval.registration?.semester?.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleApprove(approval.id)}
                          disabled={!!isApproving || !!isRejecting}
                        >
                          {isApproving === approval.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openRejectDialog(approval.id)}
                          disabled={!!isApproving || !!isRejecting}
                        >
                          {isRejecting === approval.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending approvals found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this course registration. This will be sent to the student.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={!!isRejecting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!isRejecting}>
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
