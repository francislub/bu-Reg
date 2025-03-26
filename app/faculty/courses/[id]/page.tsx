"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Download, FileText, Plus, Trash, Users } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  code: string
  title: string
  credits: number
  description: string
  department: string
  semester: string
  academicYear: string
  enrolledStudents: number
  maxCapacity: number
  schedule: string
  location: string
}

interface Student {
  id: string
  name: string
  email: string
  registrationNo: string
  registrationId: string
  registrationStatus: string
}

interface Material {
  id: string
  title: string
  type: string
  url: string
  uploadedAt: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [materialTitle, setMaterialTitle] = useState("")
  const [materialType, setMaterialType] = useState("document")
  const [materialFile, setMaterialFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (session?.user?.id && params.id) {
      fetchCourseDetails()
    }
  }, [session, params.id])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)

      // Fetch course details
      const courseRes = await fetch(`/api/courses/${params.id}`)
      const courseData = await courseRes.json()
      setCourse(courseData.course)

      // Fetch enrolled students
      const studentsRes = await fetch(`/api/courses/${params.id}/students`)
      const studentsData = await studentsRes.json()
      setStudents(studentsData.students)

      // Fetch course materials
      const materialsRes = await fetch(`/api/courses/${params.id}/materials`)
      const materialsData = await materialsRes.json()
      setMaterials(materialsData.materials)
    } catch (error) {
      console.error("Error fetching course details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMaterialFile(e.target.files[0])
    }
  }

  const handleUploadMaterial = async () => {
    if (!materialTitle || !materialFile) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file",
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
      formData.append("file", materialFile)
      formData.append("courseId", params.id as string)

      // Upload material
      const res = await fetch(`/api/courses/${params.id}/materials`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Failed to upload material")
      }

      const data = await res.json()

      // Update local state
      setMaterials((prev) => [...prev, data.material])

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      })

      // Reset form
      setMaterialTitle("")
      setMaterialType("document")
      setMaterialFile(null)
      setIsUploadDialogOpen(false)
    } catch (error) {
      console.error("Error uploading material:", error)
      toast({
        title: "Error",
        description: "Failed to upload material",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const res = await fetch(`/api/courses/${params.id}/materials/${materialId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete material")
      }

      // Update local state
      setMaterials((prev) => prev.filter((material) => material.id !== materialId))

      toast({
        title: "Success",
        description: "Material deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting material:", error)
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading course details...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Course not found.</p>
        <Button variant="link" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{course.code}</h1>
            <Badge>{course.credits} Credits</Badge>
          </div>
          <p className="text-xl">{course.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Courses
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium">Department</h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.department}</p>
                </div>
                <div>
                  <h3 className="font-medium">Semester</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.semester}, {course.academicYear}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Schedule</h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.schedule}</p>
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enrolled Students</span>
                <span className="text-sm">
                  {course.enrolledStudents}/{course.maxCapacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(course.enrolledStudents / course.maxCapacity) * 100}%` }}
                ></div>
              </div>
              <div className="pt-4">
                <Link href={`/faculty/courses/${course.id}/students`}>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View Student List
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="materials">Course Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Students currently enrolled in this course</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.registrationNo}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.registrationStatus === "APPROVED"
                                  ? "success"
                                  : student.registrationStatus === "REJECTED"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {student.registrationStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Lecture notes, assignments, and other resources</CardDescription>
              </div>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.title}</TableCell>
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
                                onClick={() => handleDeleteMaterial(material.id)}
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
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No materials uploaded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <select
                id="type"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="document">Document</option>
                <option value="assignment">Assignment</option>
                <option value="lecture">Lecture Notes</option>
                <option value="resource">Resource</option>
              </select>
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

