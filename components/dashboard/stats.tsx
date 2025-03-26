"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    registeredCourses: 0,
    completedCourses: 0,
    currentSemester: "",
    gpa: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            registeredCourses: 5,
            completedCourses: 32,
            currentSemester: "Fall 2023",
            gpa: 3.7,
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Registered Courses</p>
            <p className="text-3xl font-bold">{loading ? "..." : stats.registeredCourses}</p>
          </div>
          <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
            <BookOpen className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed Courses</p>
            <p className="text-3xl font-bold">{loading ? "..." : stats.completedCourses}</p>
          </div>
          <div className="p-2 bg-green-100 text-green-700 rounded-full">
            <GraduationCap className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
            <p className="text-3xl font-bold">{loading ? "..." : stats.currentSemester}</p>
          </div>
          <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
            <Calendar className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
            <p className="text-3xl font-bold">{loading ? "..." : stats.gpa.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-yellow-100 text-yellow-700 rounded-full">
            <Clock className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

