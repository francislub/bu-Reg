"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CheckCircle, XCircle } from "lucide-react"

export function ApprovalsList() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const userRole = session?.user?.role || "STAFF"
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // This would come from the database in a real application
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: "1",
      studentName: "Alice Johnson",
      studentId: "BU2023001",
      courseCode: "CS101",
      courseTitle: "Introduction to Computer Science",
      requestDate: "2023-09-10",
      status: "Pending",
    },
    {
      id: "2",
      studentName: "Bob Smith",
      studentId: "BU2023002",
      courseCode: "MATH201",
      courseTitle: "Calculus II",
      requestDate: "2023-09-11",
      status: "Pending",
    },
    {
      id: "3",
      studentName: "Charlie Brown",
      studentId: "BU2023003",
      courseCode: "ENG105",
      courseTitle: "Academic Writing",
      requestDate: "2023-09-12",
      status: "Pending",
    },
    {
      id: "4",
      studentName: "Diana Prince",
      studentId: "BU2023004",
      courseCode: "BUS220",
      courseTitle: "Principles of Marketing",
      requestDate: "2023-09-13",
      status: "Pending",
    },
    {
      id: "5",
      studentName: "Edward Clark",
      studentId: "BU2023005",
      courseCode: "PHYS202",
      courseTitle: "Electricity and Magnetism",
      requestDate: "2023-09-14",
      status: "Pending",
    },
  ])

  const handleAction = (item: any, actionType: "approve" | "reject") => {
    setSelectedItem(item)
    setAction(actionType)
    setComments("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedItem || !action) return

    setIsSubmitting(true)
    try {
      // This would be an API call in a real application
      console.log("Action:", action, "Item:", selectedItem, "Comments:", comments)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the local state
      setPendingApprovals(
        pendingApprovals.map((item) =>
          item.id === selectedItem.id ? { ...item, status: action === "approve" ? "Approved" : "Rejected" } : item,
        ),
      )

      toast({
        title: `${action === "approve" ? "Approved" : "Rejected"} Successfully`,
        description: `You have ${action === "approve" ? "approved" : "rejected"} ${selectedItem.studentName}'s request for ${selectedItem.courseCode}.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            {userRole === "REGISTRAR"
              ? "Student registration and course approvals pending your review."
              : "Course approvals pending your review for your department."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.studentName}</TableCell>
                  <TableCell>{item.studentId}</TableCell>
                  <TableCell>
                    {item.courseCode}: {item.courseTitle}
                  </TableCell>
                  <TableCell>{item.requestDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "Approved" ? "success" : item.status === "Rejected" ? "destructive" : "outline"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "Pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-green-600"
                          onClick={() => handleAction(item, "approve")}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600"
                          onClick={() => handleAction(item, "reject")}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {pendingApprovals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No pending approvals at this time.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve" : "Reject"} Request</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Are you sure you want to approve this request?"
                : "Please provide a reason for rejecting this request."}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Student:</span>
                <span className="col-span-3">{selectedItem.studentName}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Course:</span>
                <span className="col-span-3">
                  {selectedItem.courseCode}: {selectedItem.courseTitle}
                </span>
              </div>
              <div className="space-y-2">
                <label htmlFor="comments" className="text-sm font-medium">
                  Comments {action === "reject" && "(Required)"}:
                </label>
                <Textarea
                  id="comments"
                  placeholder={
                    action === "approve" ? "Optional comments..." : "Please provide a reason for rejection..."
                  }
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required={action === "reject"}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (action === "reject" && !comments.trim())}
              variant={action === "approve" ? "default" : "destructive"}
            >
              {isSubmitting ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
