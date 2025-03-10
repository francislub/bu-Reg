"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface Registration {
  id: string
  courseCode: string
  courseTitle: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  registeredAt: string
}

export function RecentRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRegistrations([
        {
          id: "1",
          courseCode: "CSC101",
          courseTitle: "Introduction to Computer Science",
          status: "APPROVED",
          registeredAt: "2025-02-28T10:30:00Z",
        },
        {
          id: "2",
          courseCode: "MAT101",
          courseTitle: "Calculus I",
          status: "PENDING",
          registeredAt: "2025-03-01T09:45:00Z",
        },
        {
          id: "3",
          courseCode: "ENG101",
          courseTitle: "English Composition",
          status: "REJECTED",
          registeredAt: "2025-03-02T14:20:00Z",
        },
        {
          id: "4",
          courseCode: "PHY101",
          courseTitle: "Physics I",
          status: "PENDING",
          registeredAt: "2025-03-03T08:10:00Z",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  // Sort registrations by date (newest first)
  const sortedRegistrations = [...registrations].sort(
    (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
  )

  return (
    <div className="space-y-4">
      {sortedRegistrations.map((registration) => (
        <div key={registration.id} className="border rounded-md p-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">
                {registration.courseCode}: {registration.courseTitle}
              </h4>
              <p className="text-xs text-gray-500">{new Date(registration.registeredAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center">
              {registration.status === "APPROVED" && (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Approved</span>
                </div>
              )}
              {registration.status === "PENDING" && (
                <div className="flex items-center text-amber-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
              {registration.status === "REJECTED" && (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Rejected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full">
        View All Registrations
      </Button>
    </div>
  )
}

