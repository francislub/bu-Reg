"use client"

import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"

export function RecentRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setTimeout(() => {
          setRegistrations([
            {
              id: "1",
              courseCode: "CS101",
              courseTitle: "Introduction to Computer Science",
              status: "APPROVED",
              date: "2023-08-28",
            },
            {
              id: "2",
              courseCode: "MATH201",
              courseTitle: "Calculus II",
              status: "APPROVED",
              date: "2023-08-27",
            },
            {
              id: "3",
              courseCode: "ENG105",
              courseTitle: "Academic Writing",
              status: "PENDING",
              date: "2023-08-25",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching registrations:", error)
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading registrations...</div>
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <BookOpen className="h-8 w-8 mb-2" />
        <p>No recent registrations</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {registrations.map((registration) => (
        <div key={registration.id} className="flex justify-between items-center pb-3 border-b last:border-0">
          <div>
            <h4 className="font-medium">
              {registration.courseCode}: {registration.courseTitle}
            </h4>
            <p className="text-sm text-muted-foreground">{registration.date}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              registration.status === "APPROVED"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            }`}
          >
            {registration.status}
          </div>
        </div>
      ))}
    </div>
  )
}

