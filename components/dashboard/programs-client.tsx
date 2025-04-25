"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, School, BookOpen, Clock, Users } from "lucide-react"

type Program = {
  id: string
  name: string
  code: string
  type: string
  duration: number
  departmentId: string
  description?: string
  department: {
    id: string
    name: string
    code: string
  }
  programCourses: {
    id: string
    course: {
      id: string
      code: string
      title: string
      credits: number
      department: {
        name: string
      }
    }
  }[]
}

type Department = {
  id: string
  name: string
  code: string
}

type ProgramsClientProps = {
  programs: Program[]
  departments: Department[]
  isRegistrar: boolean
}

export function ProgramsClient({ programs, departments, isRegistrar }: ProgramsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showNewProgramDialog, setShowNewProgramDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    duration: 4,
    departmentId: "",
    description: "",
  })

  // Group programs by type
  const diplomaPrograms = programs.filter((p) => p.type === "DIPLOMA")
  const bachelorsPrograms = programs.filter((p) => p.type === "BACHELORS")
  const mastersPrograms = programs.filter((p) => p.type === "MASTERS")
  const phdPrograms = programs.filter((p) => p.type === "PHD")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create program")
      }

      toast({
        title: "Program Created",
        description: "The academic program has been created successfully.",
      })

      setShowNewProgramDialog(false)
      setFormData({
        name: "",
        code: "",
        type: "",
        duration: 4,
        departmentId: "",
        description: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating program:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProgram = (programId: string) => {
    router.push(`/dashboard/programs/${programId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {programs.length > 0
                  ? Math.round(programs.reduce((acc, p) => acc + p.duration, 0) / programs.length)
                  : 0}{" "}
                years
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{programs.reduce((acc, p) => acc + p.programCourses.length, 0)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Programs</h2>
        {isRegistrar && (
          <Dialog open={showNewProgramDialog} onOpenChange={setShowNewProgramDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Academic Program</DialogTitle>
                <DialogDescription>
                  Create a new academic program for the university. Fill in all the required fields.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Program Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Bachelor of Science in Computer Science"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Program Code</Label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="BSC-CS"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Program Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange("type", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select program type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DIPLOMA">Diploma</SelectItem>
                          <SelectItem value="BACHELORS">Bachelor's Degree</SelectItem>
                          <SelectItem value="MASTERS">Master's Degree</SelectItem>
                          <SelectItem value="PHD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (years)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min={1}
                        max={10}
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department</Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => handleSelectChange("departmentId", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Program description and objectives"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowNewProgramDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Program"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="diploma">Diploma</TabsTrigger>
          <TabsTrigger value="bachelors">Bachelor's</TabsTrigger>
          <TabsTrigger value="masters">Master's</TabsTrigger>
          <TabsTrigger value="phd">PhD</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <ProgramsTable programs={programs} onViewProgram={handleViewProgram} />
        </TabsContent>
        <TabsContent value="diploma" className="mt-6">
          <ProgramsTable programs={diplomaPrograms} onViewProgram={handleViewProgram} />
        </TabsContent>
        <TabsContent value="bachelors" className="mt-6">
          <ProgramsTable programs={bachelorsPrograms} onViewProgram={handleViewProgram} />
        </TabsContent>
        <TabsContent value="masters" className="mt-6">
          <ProgramsTable programs={mastersPrograms} onViewProgram={handleViewProgram} />
        </TabsContent>
        <TabsContent value="phd" className="mt-6">
          <ProgramsTable programs={phdPrograms} onViewProgram={handleViewProgram} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProgramsTable({ programs, onViewProgram }: { programs: Program[]; onViewProgram: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No programs found
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {program.type.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{program.duration} years</TableCell>
                  <TableCell>{program.department.name}</TableCell>
                  <TableCell>{program.programCourses.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onViewProgram(program.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
