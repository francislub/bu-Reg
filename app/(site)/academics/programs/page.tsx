import Image from "next/image"
import type { Metadata } from "next"
import { BookOpen, GraduationCap, Award, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Academic Programs | Bugema University",
  description: "Explore the diverse academic programs offered at Bugema University",
}

const undergraduatePrograms = [
  {
    title: "Bachelor of Business Administration",
    description:
      "Develop essential business skills with specializations in accounting, finance, marketing, or management.",
    duration: "4 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Internship opportunities", "Business incubator access", "Industry partnerships"],
  },
  {
    title: "Bachelor of Education",
    description: "Prepare for a rewarding career in teaching with specializations in various subject areas.",
    duration: "4 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Teaching practicum", "Educational technology training", "Curriculum development"],
  },
  {
    title: "Bachelor of Science in Computer Science",
    description:
      "Gain expertise in programming, software development, artificial intelligence, and other computing disciplines.",
    duration: "4 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Software development projects", "Tech industry internships", "Coding competitions"],
  },
  {
    title: "Bachelor of Science in Nursing",
    description: "Prepare for a career in healthcare with a comprehensive nursing education program.",
    duration: "4 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Clinical rotations", "Simulation labs", "Community health projects"],
  },
  {
    title: "Bachelor of Arts in Communication",
    description: "Develop skills in media, journalism, public relations, and digital communication.",
    duration: "3 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Media production facilities", "Internship placements", "Student publications"],
  },
  {
    title: "Bachelor of Science in Agriculture",
    description: "Study sustainable farming practices, agricultural economics, and food production systems.",
    duration: "4 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["University farm access", "Agricultural research projects", "Field trips"],
  },
]

const graduatePrograms = [
  {
    title: "Master of Business Administration (MBA)",
    description:
      "Advance your business career with specialized knowledge in leadership, strategy, and organizational management.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Executive mentorship", "Business research", "Leadership development"],
  },
  {
    title: "Master of Education",
    description: "Deepen your understanding of educational theory and practice for career advancement in education.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Educational research", "Curriculum design", "Educational leadership"],
  },
  {
    title: "Master of Public Health",
    description: "Prepare for leadership roles in addressing public health challenges at local and global levels.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Health policy analysis", "Epidemiology research", "Global health initiatives"],
  },
  {
    title: "Master of Science in Information Technology",
    description: "Develop advanced skills in IT management, cybersecurity, and emerging technologies.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Advanced technology labs", "Industry partnerships", "Research opportunities"],
  },
]

const diplomaPrograms = [
  {
    title: "Diploma in Business Administration",
    description: "A practical program focusing on essential business skills for entry-level positions.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Practical business skills", "Internship placement", "Career counseling"],
  },
  {
    title: "Diploma in Information Technology",
    description: "Develop practical IT skills for technical support, network administration, and software use.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Hands-on lab sessions", "Industry certifications", "Technical projects"],
  },
  {
    title: "Diploma in Education",
    description: "Prepare for teaching roles with practical classroom management and instructional skills.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Teaching practice", "Instructional methods", "Educational psychology"],
  },
  {
    title: "Diploma in Agriculture",
    description: "Learn practical farming techniques, agricultural management, and sustainable practices.",
    duration: "2 years",
    image: "/placeholder.svg?height=300&width=500",
    highlights: ["Field work", "Agricultural projects", "Farm management"],
  },
]

export default function ProgramsPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Academic Programs</h1>
        <p className="text-xl text-muted-foreground">
          Discover the diverse range of programs offered at Bugema University
        </p>
        <Separator />
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>20+ Undergraduate Programs</CardTitle>
              <CardDescription>Bachelor's degrees across multiple disciplines</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>15+ Graduate Programs</CardTitle>
              <CardDescription>Master's and doctoral level education</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>10+ Diploma Programs</CardTitle>
              <CardDescription>Practical, career-focused qualifications</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="undergraduate">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="undergraduate">Undergraduate</TabsTrigger>
          <TabsTrigger value="graduate">Graduate</TabsTrigger>
          <TabsTrigger value="diploma">Diploma</TabsTrigger>
        </TabsList>

        <TabsContent value="undergraduate" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {undergraduatePrograms.map((program) => (
              <Card key={program.title} className="flex h-full flex-col overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{program.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{program.description}</p>
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Program Highlights:</p>
                    <ul className="ml-5 list-disc text-sm text-muted-foreground">
                      {program.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
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

          <div className="flex justify-center">
            <Button size="lg">View All Undergraduate Programs</Button>
          </div>
        </TabsContent>

        <TabsContent value="graduate" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {graduatePrograms.map((program) => (
              <Card key={program.title} className="flex h-full flex-col overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{program.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{program.description}</p>
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Program Highlights:</p>
                    <ul className="ml-5 list-disc text-sm text-muted-foreground">
                      {program.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
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

          <div className="flex justify-center">
            <Button size="lg">View All Graduate Programs</Button>
          </div>
        </TabsContent>

        <TabsContent value="diploma" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {diplomaPrograms.map((program) => (
              <Card key={program.title} className="flex h-full flex-col overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={program.image || "/placeholder.svg"} alt={program.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{program.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{program.description}</p>
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Program Highlights:</p>
                    <ul className="ml-5 list-disc text-sm text-muted-foreground">
                      {program.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
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

          <div className="flex justify-center">
            <Button size="lg">View All Diploma Programs</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 rounded-lg bg-muted p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Admission Requirements</h2>
            <p className="mb-4 text-muted-foreground">
              Each program has specific admission requirements. Generally, applicants need to meet the following
              criteria:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Completed application form</li>
              <li>Academic transcripts from previous institutions</li>
              <li>Minimum GPA requirements (varies by program)</li>
              <li>Letters of recommendation</li>
              <li>Personal statement or essay</li>
              <li>Application fee</li>
            </ul>
            <Button className="mt-6">Apply Now</Button>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold">Program Support</h2>
            <p className="mb-4 text-muted-foreground">
              Bugema University provides comprehensive support to help students succeed in their chosen programs:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
              <li>Academic advising and mentorship</li>
              <li>Career counseling and job placement assistance</li>
              <li>Tutoring and learning support services</li>
              <li>Research opportunities and funding</li>
              <li>Internship and practical experience coordination</li>
              <li>International exchange programs</li>
            </ul>
            <Button variant="outline" className="mt-6">
              Contact Academic Advisors
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
