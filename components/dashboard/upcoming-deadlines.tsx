"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

export function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setTimeout(() => {
          setDeadlines([
            {
              id: "1",
              title: "Course Registration Deadline",
              date: "2023-09-15",
              daysLeft: 5,
            },
            {
              id: "2",
              title: "Fee Payment Deadline",
              date: "2023-09-20",
              daysLeft: 10,
            },
            {
              id: "3",
              title: "Mid-Term Exams Begin",
              date: "2023-10-10",
              daysLeft: 30,
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching deadlines:", error)
        setLoading(false)
      }
    }

    fetchDeadlines()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading deadlines...</div>
  }

  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Calendar className="h-8 w-8 mb-2" />
        <p>No upcoming deadlines</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deadlines.map((deadline) => (
        <div key={deadline.id} className="flex justify-between items-center pb-3 border-b last:border-0">
          <div>
            <h4 className="font-medium">{deadline.title}</h4>
            <p className="text-sm text-muted-foreground">{deadline.date}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              deadline.daysLeft <= 7
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            }`}
          >
            {deadline.daysLeft} days left
          </div>
        </div>
      ))}
    </div>
  )
}

