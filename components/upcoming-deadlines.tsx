"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarClock, AlertCircle } from "lucide-react"

interface Deadline {
  id: string
  title: string
  description: string
  date: string
  isUrgent: boolean
}

export function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDeadlines([
        {
          id: "1",
          title: "Course Registration Deadline",
          description: "Last day to register for courses for the current semester",
          date: "2025-03-15",
          isUrgent: true,
        },
        {
          id: "2",
          title: "Tuition Fee Payment",
          description: "Deadline for paying tuition fees for the current semester",
          date: "2025-03-20",
          isUrgent: true,
        },
        {
          id: "3",
          title: "Mid-Semester Exams",
          description: "Mid-semester examinations begin",
          date: "2025-04-10",
          isUrgent: false,
        },
        {
          id: "4",
          title: "Course Withdrawal",
          description: "Last day to withdraw from courses without academic penalty",
          date: "2025-04-15",
          isUrgent: false,
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

  // Sort deadlines by date
  const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-4">
      {sortedDeadlines.map((deadline) => {
        const deadlineDate = new Date(deadline.date)
        const today = new Date()
        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isNearDeadline = daysRemaining <= 7 && daysRemaining >= 0

        return (
          <div
            key={deadline.id}
            className={`border rounded-md p-3 ${deadline.isUrgent && isNearDeadline ? "border-red-300 bg-red-50" : ""}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                {deadline.isUrgent && isNearDeadline ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <CalendarClock className="h-5 w-5 text-blue-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium">{deadline.title}</h4>
                  <p className="text-sm text-gray-600">{deadline.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{new Date(deadline.date).toLocaleDateString()}</p>
                <p
                  className={`text-xs ${daysRemaining <= 0 ? "text-red-500 font-bold" : daysRemaining <= 7 ? "text-amber-500" : "text-gray-500"}`}
                >
                  {daysRemaining <= 0
                    ? "Overdue!"
                    : daysRemaining === 1
                      ? "1 day remaining"
                      : `${daysRemaining} days remaining`}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

