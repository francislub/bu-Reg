"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Mail, Phone, Building, Users, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Faculty = {
  id: string
  name: string
  email: string
  phone?: string
  title: string
  department: {
    id: string
    name: string
    code: string
  }
  specialization?: string
  bio?: string
  imageUrl?: string
  courses?: {
    id: string
    code: string
    title: string
  }[]
}

export function FacultyDirectoryView() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [viewMode, setViewMode] = useState("grid")

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch("/api/faculty")
        if (!response.ok) throw new Error("Failed to fetch faculty data")
        const data = await response.json()
        setFaculty(data)
        setFilteredFaculty(data)
      } catch (error) {
        console.error("Error fetching faculty:", error)
        toast({
          title: "Error",
          description: "Failed to load faculty data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        if (!response.ok) throw new Error("Failed to fetch departments")
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }

    fetchFaculty()
    fetchDepartments()
  }, [toast])

  useEffect(() => {
    // Filter faculty based on search query and department filter
    const filtered = faculty.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.specialization && member.specialization.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesDepartment = departmentFilter ? member.department.id === departmentFilter : true

      return matchesSearch && matchesDepartment
    })

    setFilteredFaculty(filtered)
  }, [searchQuery, departmentFilter, faculty])

  // If no faculty data is available, show mock data
  if (faculty.length === 0 && !isLoading) {
    // Mock data for demonstration
    const mockFaculty: Faculty[] = [
      {
        id: "1",
        name: "Dr. John Smith",
        email: "john.smith@bugema.ac.ug",
        phone: "+256 700 123456",
        title: "Associate Professor",
        department: {
          id: "1",
          name: "Computer Science",
          code: "CS",
        },
        specialization: "Artificial Intelligence, Machine Learning",
        bio: "Dr. Smith has over 15 years of experience in AI research and has published numerous papers in top-tier journals.",
        courses: [
          { id: "1", code: "CS401", title: "Advanced Algorithms" },
          { id: "2", code: "CS405", title: "Artificial Intelligence" },
        ],
      },
      {
        id: "2",
        name: "Prof. Sarah Johnson",
        email: "sarah.johnson@bugema.ac.ug",
        phone: "+256 700 789012",
        title: "Professor",
        department: {
          id: "2",
          name: "Business Administration",
          code: "BA",
        },
        specialization: "Strategic Management, Entrepreneurship",
        bio: "Prof. Johnson is a leading expert in strategic management with extensive industry experience.",
        courses: [
          { id: "3", code: "BA301", title: "Strategic Management" },
          { id: "4", code: "BA405", title: "Entrepreneurship" },
        ],
      },
      {
        id: "3",
        name: "Dr. Michael Chen",
        email: "michael.chen@bugema.ac.ug",
        phone: "+256 700 345678",
        title: "Assistant Professor",
        department: {
          id: "3",
          name: "Engineering",
          code: "ENG",
        },
        specialization: "Robotics, Control Systems",
        bio: "Dr. Chen specializes in robotics and has led several research projects in autonomous systems.",
        courses: [
          { id: "5", code: "ENG302", title: "Robotics" },
          { id: "6", code: "ENG201", title: "Control Systems" },
        ],
      },
      {
        id: "4",
        name: "Dr. Emily Williams",
        email: "emily.williams@bugema.ac.ug",
        phone: "+256 700 567890",
        title: "Senior Lecturer",
        department: {
          id: "1",
          name: "Computer Science",
          code: "CS",
        },
        specialization: "Cybersecurity, Network Security",
        bio: "Dr. Williams is a cybersecurity expert with experience in both academia and industry.",
        courses: [
          { id: "7", code: "CS302", title: "Network Security" },
          { id: "8", code: "CS405", title: "Cybersecurity" },
        ],
      },
    ]

    setFaculty(mockFaculty)
    setFilteredFaculty(mockFaculty)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[250px] w-full" />
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search faculty by name, title, or specialization..."
            className="pl-8 w-full md:w-[350px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1 border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode("grid")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode("list")}
            >
              <Filter className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      {filteredFaculty.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No faculty members found</p>
            <p className="text-xs text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.imageUrl || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.title}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    {member.department.code}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{member.department.name}</span>
                  </div>
                </div>
                {member.specialization && (
                  <div>
                    <p className="text-sm font-medium">Specialization</p>
                    <p className="text-sm text-muted-foreground">{member.specialization}</p>
                  </div>
                )}
                {member.courses && member.courses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Courses</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.courses.map((course) => (
                        <Badge key={course.id} variant="outline" className="text-xs">
                          {course.code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Members</CardTitle>
            <CardDescription>
              {filteredFaculty.length} {filteredFaculty.length === 1 ? "member" : "members"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredFaculty.map((member) => (
                <div key={member.id} className="flex flex-col md:flex-row gap-4 border-b pb-6 last:border-0 last:pb-0">
                  <div className="md:w-1/4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.imageUrl || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.title}</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/4 space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/4">
                    <div className="flex items-center text-sm mb-1">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{member.department.name}</span>
                    </div>
                    {member.specialization && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Specialization:</span> {member.specialization}
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/4">
                    {member.courses && member.courses.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Courses</p>
                        <div className="flex flex-wrap gap-1">
                          {member.courses.map((course) => (
                            <Badge key={course.id} variant="outline" className="text-xs">
                              {course.code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
