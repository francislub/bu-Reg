"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Registration {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseCode: string
  courseTitle: string
  registeredAt: string
}

export function RegistrationApprovals() {
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRegistrations([
        {
          id: "1",
          studentId: "s1",
          studentName: "John Doe",
          studentEmail: "john@example.com",
          courseId: "c1",
          courseCode: "CSC101",
          courseTitle: "Introduction to Computer Science",
          registeredAt: "2023-09-01",
        },
        {
          id: "2",
          studentId: "s2",
          studentName: "Jane Smith",
          studentEmail: "jane@example.com",
          courseId: "c2",
          courseCode: "MAT101",
          courseTitle: "Calculus I",
          registeredAt: "2023-09-02",
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleApprove = async (id: string) => {
    try {
      // Simulate API call
      // In a real app, this would be an API call to update the registration status
      setRegistrations(registrations.filter((reg) => reg.id !== id))
      toast({
        title: "Registration Approved",
        description: "The student registration has been approved.",
      })
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to approve registration.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      // Simulate API call
      setRegistrations(registrations.filter((reg) => reg.id !== id))
      toast({
        title: "Registration Rejected",
        description: "The student registration has been rejected.",
      })
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to reject registration.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Registration>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <div>{row.original.studentName}</div>
          <div className="text-xs text-gray-500">{row.original.studentEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "courseCode",
      header: "Course",
      cell: ({ row }) => (
        <div>
          <div>{row.original.courseCode}</div>
          <div className="text-xs text-gray-500">{row.original.courseTitle}</div>
        </div>
      ),
    },
    {
      accessorKey: "registeredAt",
      header: "Registered At",
      cell: ({ row }) => new Date(row.original.registeredAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
            onClick={() => handleApprove(row.original.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
            onClick={() => handleReject(row.original.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={registrations} isLoading={isLoading} />
}

