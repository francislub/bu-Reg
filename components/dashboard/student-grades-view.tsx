"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type Grade = {
  id: string
  courseId: string
  course: {
    id: string
    code: string
    title: string
    credits: number
    department: {
      id: string
      name: string
      code: string
    }
  }
  semesterId: string
  semester: {
    id: string
    name: string
    isActive: boolean
  }
  midtermScore: number | null
  finalScore: number | null
  totalScore: number
  grade: string
  gradePoint: number
  status: "PASSED" | "FAILED" | "INCOMPLETE"
  comments: string | null
}

type SemesterSummary = {
  semesterId: string
  semesterName: string
  totalCredits: number
  totalGradePoints: number
  gpa: number
  courses: number
}

export function StudentGradesView({ userId }: { userId: string }) {
  const { toast } = useToast()
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [semesters, setSemesters] = useState<{ id: string; name: string; isActive: boolean }[]>([])
  const [selectedSemester, setSelectedSemester] = useState("")
  const [semesterSummaries, setSemesterSummaries] = useState<SemesterSummary[]>([])
  const [cumulativeGPA, setCumulativeGPA] = useState(0)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        let url = `/api/students/${userId}/grades`
        if (selectedSemester) {
          url += `?semesterId=${selectedSemester}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch grades")
        const data = await response.json()
        setGrades(data)
      } catch (error) {
        console.error("Error fetching grades:", error)
        toast({
          title: "Error",
          description: "Failed to load grades. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSemesters = async () => {
      try {
        const response = await fetch("/api/semesters")
        if (!response.ok) throw new Error("Failed to fetch semesters")
        const data = await response.json()
        setSemesters(data)
        
        // Set the active semester as default
        const activeSemester = data.find((sem: any) => sem.isActive)
        if (activeSemester) {
          setSelectedSemester(activeSemester.id)
        }
      } catch (error) {
        console.error("Error fetching semesters:", error)
      }
    }

    const fetchSemesterSummaries = async () => {
      try {
        const response = await fetch(`/api/students/${userId}/grades/summary`)
        if (!response.ok) throw new Error("Failed to fetch grade summaries")
        const data = await response.json()
        setSemesterSummaries(data.semesterSummaries)
        setCumulativeGPA(data.cumulativeGPA)
      } catch (error) {
        console.error("Error fetching grade summaries:", error)
      }
    }

    fetchSemesters()
    fetchGrades()
    fetchSemesterSummaries()
  }, [userId, selectedSemester, toast])

  // Calculate semester GPA for the selected semester
  const calculateSemesterGPA = () => {
    if (grades.length === 0) return 0

    const totalCredits = grades.reduce((sum, grade) => sum + grade.course.credits, 0)
    const totalGradePoints = grades.reduce((sum, grade) => sum + (grade.gradePoint * grade.course.credits), 0)

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0
  }

  // Get letter grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
      case "A-":
        return "bg-green-100 text-green-800"
      case "B+":
      case "B":
      case "B-":
        return "bg-blue-100 text-blue-800"
      case "C+":
      case "C":
      case "C-":
        return "bg-yellow-100 text-yellow-800"
      case "D+":
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "bg-green-100 text-green-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "INCOMPLETE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // If no grades are available, show mock data
  if (grades.length === 0 && !isLoading) {
    // Mock data for demonstration
    const mockGrades: Grade[] = [
      {
        id: "1",
        courseId: "1",
        course: {
          id: "1",
          code: "CS101",
          title
