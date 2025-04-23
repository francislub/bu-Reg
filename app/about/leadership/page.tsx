import Image from "next/image"
import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Leadership | Bugema University",
  description: "Meet the leadership team of Bugema University",
}

const leadershipTeam = [
  {
    name: "Prof. Patrick Manu",
    title: "Vice Chancellor",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Prof. Manu has served as Vice Chancellor since 2018. He holds a PhD in Educational Administration from Andrews University and has over 25 years of experience in higher education leadership.",
  },
  {
    name: "Dr. Sarah Nakato",
    title: "Deputy Vice Chancellor (Academic Affairs)",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Nakato oversees all academic programs and faculty development. She earned her doctorate in Curriculum Development from the University of Nairobi and has published extensively in educational journals.",
  },
  {
    name: "Dr. James Okello",
    title: "Deputy Vice Chancellor (Administration)",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Okello manages the university's administrative functions, including finance, human resources, and facilities. He has an MBA and PhD in Business Administration from Makerere University.",
  },
  {
    name: "Prof. Ruth Nambi",
    title: "University Registrar",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Prof. Nambi oversees student admissions, records, and graduation processes. She has been with Bugema University for over 15 years and holds a PhD in Public Administration.",
  },
]

const deans = [
  {
    name: "Prof. Daniel Ssemakula",
    title: "Dean, School of Business",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Prof. Ssemakula has led the School of Business since 2015. He specializes in entrepreneurship and has helped establish partnerships with leading corporations across East Africa.",
  },
  {
    name: "Dr. Elizabeth Kigozi",
    title: "Dean, School of Education",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Kigozi is an expert in educational psychology and curriculum development. She has implemented innovative teaching methodologies that have significantly improved student outcomes.",
  },
  {
    name: "Prof. Samuel Muwanga",
    title: "Dean, School of Technology",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Prof. Muwanga brings industry experience from his time at Microsoft East Africa. He has transformed the technology curriculum to meet current industry demands.",
  },
  {
    name: "Dr. Grace Nambatya",
    title: "Dean, School of Health Sciences",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Nambatya is a respected researcher in public health. Under her leadership, the School of Health Sciences has secured several research grants and international collaborations.",
  },
]

const boardMembers = [
  {
    name: "Hon. Joseph Mukasa",
    title: "Chairperson, University Council",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Hon. Mukasa is a former Minister of Education and brings valuable policy experience to the University Council. He has served as Chairperson since 2019.",
  },
  {
    name: "Mrs. Florence Lubega",
    title: "Vice Chairperson, University Council",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Mrs. Lubega is a prominent business leader and philanthropist. She has been instrumental in fundraising efforts for university expansion projects.",
  },
  {
    name: "Mr. Robert Kiggundu",
    title: "Council Secretary",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Mr. Kiggundu is a legal expert specializing in educational law and governance. He ensures the university's compliance with regulatory requirements.",
  },
  {
    name: "Dr. Esther Nakazzi",
    title: "Council Member",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dr. Nakazzi represents alumni interests on the Council. She is the CEO of a major telecommunications company and a proud Bugema graduate.",
  },
]

export default function LeadershipPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">University Leadership</h1>
        <p className="text-xl text-muted-foreground">
          Meet the dedicated team guiding Bugema University toward excellence
        </p>
        <Separator />
      </div>

      <Tabs defaultValue="executive">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="executive">Executive Team</TabsTrigger>
          <TabsTrigger value="deans">Deans</TabsTrigger>
          <TabsTrigger value="board">University Council</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-8">
          <p className="text-lg text-muted-foreground">
            Our executive leadership team is responsible for the day-to-day management and strategic direction of Bugema
            University.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadershipTeam.map((leader) => (
              <Card key={leader.name} className="overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image src={leader.image || "/placeholder.svg"} alt={leader.name} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold">{leader.name}</h3>
                  <p className="mb-2 text-sm text-primary">{leader.title}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deans" className="space-y-8">
          <p className="text-lg text-muted-foreground">
            Our academic deans lead the various schools and faculties, ensuring educational excellence and innovation.
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
        </TabsContent>

        <TabsContent value="board" className="space-y-8">
          <p className="text-lg text-muted-foreground">
            The University Council provides governance oversight and strategic guidance to ensure Bugema University
            fulfills its mission.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {boardMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="mb-2 text-sm text-primary">{member.title}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-16 rounded-lg bg-muted p-8">
        <h2 className="mb-4 text-2xl font-bold">Leadership Philosophy</h2>
        <p className="mb-4 text-muted-foreground">
          At Bugema University, our leadership is guided by principles of integrity, innovation, and service. We believe
          in:
        </p>
        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
          <li>Transparent and ethical governance in all university affairs</li>
          <li>Collaborative decision-making that includes faculty, staff, and student perspectives</li>
          <li>Continuous improvement through data-driven assessment and feedback</li>
          <li>Fostering an inclusive environment that celebrates diversity</li>
          <li>Maintaining a student-centered approach in all policies and initiatives</li>
        </ul>
      </div>
    </div>
  )
}
