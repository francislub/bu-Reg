"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updateStudentProgramAndDepartment } from "@/lib/actions/program-department-actions"

export function ProgramSelectionForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [programs, setPrograms] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<string>("")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/programs")
        if (!response.ok) throw new Error("Failed to fetch programs")

        const data = await response.json()
        setPrograms(data.programs || [])
      } catch (error) {
        console.error("Error fetching programs:", error)
        toast({
          title: "Error",
          description: "Failed to load programs. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
  }, [toast])

  useEffect(() => {
    if (!selectedProgramId) {
      setDepartments([])
      setSelectedDepartmentId("")
      return
    }

    const fetchDepartments = async () => {
      try {
        const response = await fetch(`/api/departments/by-program/${selectedProgramId}`)
        if (!response.ok) throw new Error("Failed to fetch departments")

        const data = await response.json()
        setDepartments(data.departments || [])

        // If there's only one department, auto-select it
        if (data.departments && data.departments.length === 1) {
          setSelectedDepartmentId(data.departments[0].id)
        } else {
          setSelectedDepartmentId("")
        }
      } catch (error) {
        console.error("Error fetching departments:", error)
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchDepartments()
  }, [selectedProgramId, toast])

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to select a program.",
        variant: "destructive",
      })
      return
    }

    if (!selectedProgramId || !selectedDepartmentId) {
      toast({
        title: "Error",
        description: "Please select both a program and department.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateStudentProgramAndDepartment(session.user.id, selectedProgramId, selectedDepartmentId)

      if (result.success) {
        toast({
          title: "Success",
          description: "Program and department updated successfully.",
        })
        router.push("/dashboard/course-registration")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update program and department.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating program and department:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session || session.user.role !== "STUDENT") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Only students can select programs and departments.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Program</CardTitle>
        <CardDescription>Choose your program and department to view available courses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId} disabled={isSubmitting}>
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.length > 0 ? (
                    programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} ({program.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No programs available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={selectedDepartmentId}
                onValueChange={setSelectedDepartmentId}
                disabled={!selectedProgramId || departments.length === 0 || isSubmitting}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.length > 0 ? (
                    departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name} ({department.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {selectedProgramId ? "No departments available" : "Select a program first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedProgramId || !selectedDepartmentId || isSubmitting}
          className="w-full"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to Course Registration
        </Button>
      </CardFooter>
    </Card>
  )
}
