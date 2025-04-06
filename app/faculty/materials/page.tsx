"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Download, FileText, Plus, Search, Trash } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  code: string
  title: string
}

interface Material {
  id: string
  title: string
  type: string
  courseId: string
  courseName: string
  courseCode: string
  url: string
  uploadedAt: string
}

export default function MaterialsPage() {
  const { data: session } = useSession()
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [materialTitle, setMaterialTitle] = useState("")
  const [materialType, setMaterialType] = useState("document")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchMaterials()
      fetchCourses()
    }
  }, [session])

  useEffect(() => {
    if (materials.length > 0) {
      applyFilters()
    }
  }, [materials, searchTerm, courseFilter, typeFilter])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/faculty/materials?facultyId=${session.user.id}`)
      const data = await res.json()
      setMaterials(data.materials)
    } catch (error) {
      console.error("Error fetching materials:", error)
      useToast({
        title: "Error",
        description: "Failed to fetch course materials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/faculty/courses?facultyId=${session.user.id}`)
      const data = await res.json()
      setCourses(data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...materials]

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.courseCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (courseFilter && courseFilter !== "all") {
      filtered = filtered.filter((material) => material.courseId === courseFilter)
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((material) => material.type === typeFilter)
    }

    setFilteredMaterials(filtered)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMaterialFile(e.target.files[0])
    }
  }

  const handleUploadMaterial = async () => {
    if (!materialTitle || !selectedCourse || !materialFile) {
      useToast({
        title: "Missing information",
        description: "Please provide a title, select a course, and select a file",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      // Create form data
      const formData = new FormData()
      formData.append("title", materialTitle)
      formData.append("type", materialType)
      formData.append("courseId", selectedCourse)
      formData.append("file", materialFile)

      // Upload material
      const res = await fetch(`/api/courses/${selectedCourse}/materials`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Failed to upload material")
      }

      const data = await res.json()

      // Get course details for the new material
      const course = courses.find((c) => c.id === selectedCourse)

      // Update local state
      if (course) {
        const newMaterial = {
          ...data.material,
          courseName: course.title,
          courseCode: course.code,
        }
        setMaterials((prev) => [...prev, newMaterial])
      }

      useToast({
        title: "Success",
        description: "Material uploaded successfully",
      })

      // Reset form
      setMaterialTitle("")
      setMaterialType("document")
      setSelectedCourse("")
      setMaterialFile(null)
      setIsUploadDialogOpen(false)
    } catch (error) {
      console.error("Error uploading material:", error)
      useToast({
        title: "Error",
        description: "Failed to upload material",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMaterial = async (materialId: string, courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/materials/${materialId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete material")
      }

      // Update local state
      setMaterials((prev) => prev.filter((material) => material.id !== materialId))

      useToast({
        title: "Success",
        description: "Material deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting material:", error)
      useToast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      })
    }
  }

  const materialTypes = [
    { value: "document", label: "Document" },
    { value: "assignment", label: "Assignment" },
    { value: "lecture", label: "Lecture Notes" },
    { value: "resource", label: "Resource" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Course Materials</h1>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search materials..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {materialTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
          <CardDescription>Manage your course materials across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading materials...</p>
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell>
                        <Link href={`/faculty/courses/${material.courseId}`} className="hover:underline">
                          {material.courseCode}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(material.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={material.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteMaterial(material.id, material.courseId)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No materials found matching your criteria.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Material Dialog */}
      <AlertDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Course Material</AlertDialogTitle>
            <AlertDialogDescription>Add a new material for students to access.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="Enter material title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="course" className="text-sm font-medium">
                Course
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code}: {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select material type" />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">
                File
              </label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUploadMaterial} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

