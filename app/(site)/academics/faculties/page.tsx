import Image from "next/image"
import type { Metadata } from "next"
import { Users, BookOpen, Microscope, Calculator, Globe, HeartPulse, Briefcase, Landmark } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Faculties | Bugema University",
  description: "Explore the academic faculties and schools at Bugema University",
}

const faculties = [
  {
    name: "School of Business",
    description:
      "Preparing future business leaders through innovative programs in management, finance, marketing, and entrepreneurship.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Briefcase className="h-6 w-6" />,
    departments: [
      "Department of Management",
      "Department of Accounting & Finance",
      "Department of Marketing",
      "Department of Entrepreneurship",
    ],
    programs: [
      "Bachelor of Business Administration",
      "Master of Business Administration",
      "Diploma in Business Studies",
    ],
    faculty: 24,
    students: 850,
  },
  {
    name: "School of Education",
    description:
      "Developing skilled educators through programs that combine educational theory with practical teaching experience.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <BookOpen className="h-6 w-6" />,
    departments: [
      "Department of Educational Psychology",
      "Department of Curriculum & Instruction",
      "Department of Educational Administration",
    ],
    programs: ["Bachelor of Education", "Master of Education", "Postgraduate Diploma in Education"],
    faculty: 18,
    students: 620,
  },
  {
    name: "School of Science & Technology",
    description:
      "Advancing scientific knowledge and technological innovation through research and practical application.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Microscope className="h-6 w-6" />,
    departments: [
      "Department of Computer Science",
      "Department of Mathematics",
      "Department of Physics",
      "Department of Chemistry",
      "Department of Biology",
    ],
    programs: [
      "Bachelor of Science in Computer Science",
      "Bachelor of Science in Mathematics",
      "Master of Science in Information Technology",
    ],
    faculty: 32,
    students: 780,
  },
  {
    name: "School of Health Sciences",
    description: "Training healthcare professionals to address the health challenges of today and tomorrow.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <HeartPulse className="h-6 w-6" />,
    departments: ["Department of Nursing", "Department of Public Health", "Department of Nutrition"],
    programs: ["Bachelor of Science in Nursing", "Bachelor of Science in Public Health", "Master of Public Health"],
    faculty: 26,
    students: 540,
  },
  {
    name: "School of Humanities & Social Sciences",
    description: "Exploring human culture, society, and behavior through interdisciplinary approaches.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Globe className="h-6 w-6" />,
    departments: [
      "Department of Languages & Literature",
      "Department of History",
      "Department of Sociology",
      "Department of Psychology",
    ],
    programs: [
      "Bachelor of Arts in Communication",
      "Bachelor of Arts in Sociology",
      "Master of Arts in Counseling Psychology",
    ],
    faculty: 22,
    students: 490,
  },
  {
    name: "School of Graduate Studies",
    description:
      "Advancing knowledge through specialized research and professional development at the postgraduate level.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Calculator className="h-6 w-6" />,
    departments: ["Department of Research & Innovation", "Department of Professional Development"],
    programs: ["Master's Programs", "Doctoral Programs", "Postgraduate Diplomas"],
    faculty: 15,
    students: 320,
  },
  {
    name: "School of Law",
    description: "Preparing legal professionals with a strong foundation in legal theory, ethics, and practice.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Landmark className="h-6 w-6" />,
    departments: ["Department of Private Law", "Department of Public Law", "Department of International Law"],
    programs: ["Bachelor of Laws (LLB)", "Master of Laws (LLM)"],
    faculty: 16,
    students: 280,
  },
]

const deans = [
  {
    name: "Prof. Daniel Ssemakula",
    title: "Dean, School of Business",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Prof. Ssemakula holds a PhD in Business Administration from Harvard Business School and has over 20 years of experience in business education and research.",
  },
  {
    name: "Dr. Elizabeth Kigozi",
    title: "Dean, School of Education",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Kigozi is an expert in educational psychology with a PhD from the University of Cambridge. She has implemented innovative teaching methodologies that have significantly improved student outcomes.",
  },
  {
    name: "Prof. Samuel Muwanga",
    title: "Dean, School of Science & Technology",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Prof. Muwanga brings industry experience from his time at Microsoft East Africa. He has a PhD in Computer Science from MIT and has transformed the technology curriculum to meet current industry demands.",
  },
  {
    name: "Dr. Grace Nambatya",
    title: "Dean, School of Health Sciences",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Nambatya is a respected researcher in public health with a PhD from Johns Hopkins University. Under her leadership, the School of Health Sciences has secured several research grants and international collaborations.",
  },
]

export default function FacultiesPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Academic Faculties</h1>
        <p className="text-xl text-muted-foreground">
          Explore our diverse schools and faculties offering quality education across disciplines
        </p>
        <Separator />
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Excellence Across Disciplines</h2>
          <p className="text-muted-foreground">
            Bugema University is organized into several schools and faculties, each dedicated to excellence in teaching,
            research, and community service. Our academic units are led by distinguished scholars and practitioners who
            are committed to providing students with a transformative educational experience.
          </p>
          <p className="text-muted-foreground">
            Each faculty maintains strong connections with industry partners, professional organizations, and
            international academic institutions to ensure our programs remain relevant and our graduates are competitive
            in the global marketplace.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg">Faculty Directory</Button>
            <Button variant="outline" size="lg">
              Research Publications
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-lg bg-muted p-6 text-center">
            <Users className="mb-2 h-10 w-10 text-primary" />
            <h3 className="text-2xl font-bold">150+</h3>
            <p className="text-sm text-muted-foreground">Faculty Members</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted p-6 text-center">
            <BookOpen className="mb-2 h-10 w-10 text-primary" />
            <h3 className="text-2xl font-bold">7</h3>
            <p className="text-sm text-muted-foreground">Academic Schools</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted p-6 text-center">
            <Calculator className="mb-2 h-10 w-10 text-primary" />
            <h3 className="text-2xl font-bold">30+</h3>
            <p className="text-sm text-muted-foreground">Departments</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-muted p-6 text-center">
            <Microscope className="mb-2 h-10 w-10 text-primary" />
            <h3 className="text-2xl font-bold">50+</h3>
            <p className="text-sm text-muted-foreground">Research Centers</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="faculties">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="faculties">Schools & Faculties</TabsTrigger>
          <TabsTrigger value="leadership">Faculty Leadership</TabsTrigger>
        </TabsList>

        <TabsContent value="faculties" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {faculties.map((faculty) => (
              <Card key={faculty.name} className="flex h-full flex-col">
                <div className="relative h-48 w-full">
                  <Image src={faculty.image || "/placeholder.svg"} alt={faculty.name} fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 flex h-12 w-12 items-center justify-center rounded-tr-lg bg-primary text-primary-foreground">
                    {faculty.icon}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{faculty.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {faculty.faculty} Faculty | {faculty.students} Students
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="mb-4 text-muted-foreground">{faculty.description}</p>

                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">Departments</h4>
                    <ul className="ml-5 list-disc text-sm text-muted-foreground">
                      {faculty.departments.map((dept) => (
                        <li key={dept}>{dept}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Featured Programs</h4>
                    <ul className="ml-5 list-disc text-sm text-muted-foreground">
                      {faculty.programs.map((program) => (
                        <li key={program}>{program}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leadership" className="space-y-8">
          <p className="text-lg text-muted-foreground">
            Our faculties are led by distinguished academics with extensive experience in their fields. Meet the deans
            who guide our academic vision and excellence.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {deans.map((dean) => (
              <Card key={dean.name} className="overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image src={dean.image || "/placeholder.svg"} alt={dean.name} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold">{dean.name}</h3>
                  <p className="mb-2 text-sm text-primary">{dean.title}</p>
                  <p className="text-sm text-muted-foreground">{dean.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button>View All Faculty Leadership</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 rounded-lg bg-muted p-8">
        <h2 className="mb-6 text-2xl font-bold">Faculty Research & Innovation</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Research Centers</h3>
              <p className="text-muted-foreground">
                Our specialized research centers focus on addressing local and global challenges through
                interdisciplinary collaboration.
              </p>
              <Button variant="link" className="mt-2 p-0">
                Explore Research Centers
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Publications</h3>
              <p className="text-muted-foreground">
                Faculty members regularly publish their research in prestigious academic journals and present at
                international conferences.
              </p>
              <Button variant="link" className="mt-2 p-0">
                Browse Publications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Industry Partnerships</h3>
              <p className="text-muted-foreground">
                We collaborate with industry partners to ensure our research has practical applications and our students
                gain relevant experience.
              </p>
              <Button variant="link" className="mt-2 p-0">
                View Partnerships
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
