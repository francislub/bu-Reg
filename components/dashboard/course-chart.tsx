"use client"

import { useEffect, useState } from "react"

export function CourseChart() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading chart data...</div>
  }

  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
      <p className="text-muted-foreground">Course registration chart will be displayed here</p>
      {/* In a real app, you would use a charting library like Chart.js or Recharts */}
    </div>
  )
}

