"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/dashboard/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, Plus, Printer, Trash2, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TimetableView } from "@/components/dashboard/timetable-view"
import { TimetableEditor } from "@/components/dashboard/timetable-editor"

type Semester = {
  id: string
  name: string
  isActive: boolean
}

type Timetable = {
  id: string
  name: string
  semesterId: string
  semester: Semester
  isPublished: boolean
  createdAt: string
  updatedAt: string
  slots: TimetableSlot[]
}

type Course = {
  id: string
  code: string
  title: string
}

type LecturerCourse = {
  id: string
  lecturer: {
    id: string
    name: string
  }
  course: Course
}

type TimetableSlot = {
  id: string
  timetableId: string
  courseId: string
  lecturerCourseId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  roomNumber: string
  course: Course
  lecturerCourse?: LecturerCourse
}

export function TimetableManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentTimetable, setCurrentTimetable] = useState<Timetable | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    semesterId: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("list")
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch semesters
        const semestersRes = await fetch("/api/semesters")
        const semestersData = await semestersRes.json()
        setSemesters(semestersData)

        // Set default selected semester to active semester
        const activeSemester = semestersData.find((s: Semester) => s.isActive)
        if (activeSemester) {
          setSelectedSemester(activeSemester.id)
          setFormData((prev) => ({ ...prev, semesterId: activeSemester.id }))

          // Fetch timetables for active semester
          const timetablesRes = await fetch(`/api/timetables?semesterId=${activeSemester.id}`)
          const timetablesData = await timetablesRes.json()
          setTimetables(timetablesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSemesterChange = async (semesterId: string) => {
    setSelectedSemester(semesterId)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/timetables?semesterId=${semesterId}`)
      const data = await res.json()
      setTimetables(data)
    } catch (error) {
      console.error("Error fetching timetables:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load timetables. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.semesterId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = isEditMode && currentTimetable ? `/api/timetables/${currentTimetable.id}` : "/api/timetables"

      const method = isEditMode ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save timetable")
      }

      const data = await res.json()

      toast({
        title: "Success",
        description: isEditMode ? "Timetable updated successfully." : "Timetable created successfully.",
      })

      // Refresh timetables
      const timetablesRes = await fetch(`/api/timetables?semesterId=${selectedSemester}`)
      const timetablesData = await timetablesRes.json()
      setTimetables(timetablesData)

      // Reset form and close dialog
      setFormData({
        name: "",
        semesterId: selectedSemester,
      })
      setIsDialogOpen(false)
      setIsEditMode(false)
      setCurrentTimetable(null)
    } catch (error) {
      console.error("Error saving timetable:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save timetable.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (timetable: Timetable) => {
    setIsEditMode(true)
    setCurrentTimetable(timetable)
    setFormData({
      name: timetable.name,
      semesterId: timetable.semesterId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable?")) {
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/timetables/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to delete timetable")
      }

      toast({
        title: "Success",
        description: "Timetable deleted successfully.",
      })

      // Refresh timetables
      const timetablesRes = await fetch(`/api/timetables?semesterId=${selectedSemester}`)
      const timetablesData = await timetablesRes.json()
      setTimetables(timetablesData)
    } catch (error) {
      console.error("Error deleting timetable:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete timetable.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setCurrentTimetable(null)
    setFormData({
      name: "",
      semesterId: selectedSemester,
    })
    setIsDialogOpen(true)
  }

  const handleViewTimetable = (timetable: Timetable) => {
    setSelectedTimetable(timetable)
    setActiveTab("view")
  }

  const handleEditTimetable = (timetable: Timetable) => {
    setSelectedTimetable(timetable)
    setActiveTab("edit")
  }

  const handlePublishTimetable = async (id: string, isPublished: boolean) => {
    setIsLoading(true)

    try {
      const res = await fetch(`/api/timetables/${id}/publish`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || `Failed to ${isPublished ? "publish" : "unpublish"} timetable`)
      }

      toast({
        title: "Success",
        description: `Timetable ${isPublished ? "published" : "unpublished"} successfully.`,
      })

      // Refresh timetables
      const timetablesRes = await fetch(`/api/timetables?semesterId=${selectedSemester}`)
      const timetablesData = await timetablesRes.json()
      setTimetables(timetablesData)
    } catch (error) {
      console.error(`Error ${isPublished ? "publishing" : "unpublishing"} timetable:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${isPublished ? "publish" : "unpublish"} timetable.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTimetables = timetables.filter((t) => {
    const searchLower = searchQuery.toLowerCase()
    return t.name.toLowerCase().includes(searchLower) || t.semester.name.toLowerCase().includes(searchLower)
  })

  const columns: ColumnDef<Timetable>[] = [
    {
      accessorKey: "name",
      header: "Timetable Name",
    },
    {
      accessorKey: "semester.name",
      header: "Semester",
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.original.isPublished

        return <Badge variant={isPublished ? "success" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const timetable = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleViewTimetable(timetable)} title="View Timetable">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditTimetable(timetable)}
              title="Edit Timetable Slots"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Slots</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePublishTimetable(timetable.id, !timetable.isPublished)}
              title={timetable.isPublished ? "Unpublish Timetable" : "Publish Timetable"}
            >
              {timetable.isPublished ? (
                <Calendar className="h-4 w-4 text-green-500" />
              ) : (
                <Calendar className="h-4 w-4 text-gray-500" />
              )}
              <span className="sr-only">{timetable.isPublished ? "Unpublish" : "Publish"}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(timetable)} title="Edit Timetable Details">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(timetable.id)} title="Delete Timetable">
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Timetable List</TabsTrigger>
          {selectedTimetable && <TabsTrigger value="view">View Timetable</TabsTrigger>}
          {selectedTimetable && <TabsTrigger value="edit">Edit Timetable</TabsTrigger>}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timetables</CardTitle>
              <CardDescription>Manage timetables for each semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="w-full sm:w-64">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={selectedSemester} onValueChange={handleSemesterChange} disabled={isLoading}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id}>
                            {semester.name} {semester.isActive && "(Active)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-64">
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search timetables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddNew} disabled={isLoading || !selectedSemester} className="mt-4 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Timetable
                </Button>
              </div>

              <div className="mt-6">
                <DataTable
                  columns={columns}
                  data={filteredTimetables}
                  isLoading={isLoading}
                  noDataText="No timetables found"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view">
          {selectedTimetable && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{selectedTimetable.name}</CardTitle>
                  <CardDescription>
                    {selectedTimetable.semester.name} {selectedTimetable.semester.isActive && "(Active)"}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("list")}>
                    Back to List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TimetableView timetable={selectedTimetable} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit">
          {selectedTimetable && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Edit Timetable: {selectedTimetable.name}</CardTitle>
                  <CardDescription>
                    {selectedTimetable.semester.name} {selectedTimetable.semester.isActive && "(Active)"}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setActiveTab("list")}>
                  Back to List
                </Button>
              </CardHeader>
              <CardContent>
                <TimetableEditor
                  timetable={selectedTimetable}
                  onSave={() => {
                    // Refresh timetables after save
                    const fetchTimetables = async () => {
                      try {
                        const res = await fetch(`/api/timetables?semesterId=${selectedSemester}`)
                        const data = await res.json()
                        setTimetables(data)

                        // Update selected timetable
                        const updatedTimetable = data.find((t: Timetable) => t.id === selectedTimetable.id)
                        if (updatedTimetable) {
                          setSelectedTimetable(updatedTimetable)
                        }
                      } catch (error) {
                        console.error("Error refreshing timetables:", error)
                      }
                    }
                    fetchTimetables()
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Timetable" : "Create New Timetable"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the timetable details below." : "Enter the details for the new timetable."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Timetable Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Semester 1 2023/2024 Timetable"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semesterId">Semester</Label>
                <Select
                  value={formData.semesterId}
                  onValueChange={(value) => handleSelectChange("semesterId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="semesterId">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id}>
                        {semester.name} {semester.isActive && "(Active)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
