import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AcademicsLayout } from "@/components/site/academics-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Mail, Phone, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Faculty & Staff | Bugema University",
  description:
    "Meet our distinguished faculty and staff members who are dedicated to academic excellence and student success.",
}

export default function FacultyPage() {
  return (
    <AcademicsLayout
      title="Faculty & Staff"
      description="Meet our distinguished faculty members who are experts in their fields and dedicated to student success."
      breadcrumbTitle="Faculty & Staff"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Our Academic Team</h2>
          <p className="text-gray-700 mb-6">
            At Bugema University, our faculty members are distinguished scholars, researchers, and practitioners who
            bring a wealth of knowledge and experience to the classroom. They are dedicated to providing quality
            education and mentoring students to achieve their full potential.
          </p>

          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Faculty members at Bugema University"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Faculty Directory</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="search" placeholder="Search faculty..." className="pl-10" />
            </div>
          </div>

          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto">
              <TabsTrigger value="business" className="py-3">
                Business
              </TabsTrigger>
              <TabsTrigger value="education" className="py-3">
                Education
              </TabsTrigger>
              <TabsTrigger value="health" className="py-3">
                Health Sciences
              </TabsTrigger>
              <TabsTrigger value="technology" className="py-3">
                Technology
              </TabsTrigger>
              <TabsTrigger value="humanities" className="py-3">
                Humanities
              </TabsTrigger>
              <TabsTrigger value="science" className="py-3">
                Science
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FacultyCard
                  name="Dr. Samuel Muwanguzi"
                  title="Dean, School of Business"
                  specialization="Strategic Management"
                  image="/placeholder.svg?height=300&width=300"
                  email="smuwanguzi@bugemauniv.ac.ug"
                  phone="+256-414-351450"
                />
                <FacultyCard
                  name="Dr. Sarah Namubiru"
                  title="Associate Professor"
                  specialization="Finance and Accounting"
                  image="/placeholder.svg?height=300&width=300"
                  email="snamubiru@bugemauniv.ac.ug"
                  phone="+256-414-351451"
                />
                <FacultyCard
                  name="Dr. Robert Mukasa"
                  title="Senior Lecturer"
                  specialization="Marketing"
                  image="/placeholder.svg?height=300&width=300"
                  email="rmukasa@bugemauniv.ac.ug"
                  phone="+256-414-351452"
                />
                <FacultyCard
                  name="Dr. Jane Nakato"
                  title="Lecturer"
                  specialization="Human Resource Management"
                  image="/placeholder.svg?height=300&width=300"
                  email="jnakato@bugemauniv.ac.ug"
                  phone="+256-414-351453"
                />
                <FacultyCard
                  name="Mr. David Ssempala"
                  title="Assistant Lecturer"
                  specialization="Entrepreneurship"
                  image="/placeholder.svg?height=300&width=300"
                  email="dssempala@bugemauniv.ac.ug"
                  phone="+256-414-351454"
                />
                <FacultyCard
                  name="Ms. Grace Namirembe"
                  title="Assistant Lecturer"
                  specialization="Supply Chain Management"
                  image="/placeholder.svg?height=300&width=300"
                  email="gnamirembe@bugemauniv.ac.ug"
                  phone="+256-414-351455"
                />
              </div>
            </TabsContent>

            <TabsContent value="education" className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FacultyCard
                  name="Dr. Elizabeth Namazzi"
                  title="Dean, School of Education"
                  specialization="Educational Leadership"
                  image="/placeholder.svg?height=300&width=300"
                  email="enamazzi@bugemauniv.ac.ug"
                  phone="+256-414-351460"
                />
                <FacultyCard
                  name="Dr. John Kigozi"
                  title="Associate Professor"
                  specialization="Curriculum Development"
                  image="/placeholder.svg?height=300&width=300"
                  email="jkigozi@bugemauniv.ac.ug"
                  phone="+256-414-351461"
                />
                <FacultyCard
                  name="Dr. Mary Nantongo"
                  title="Senior Lecturer"
                  specialization="Educational Psychology"
                  image="/placeholder.svg?height=300&width=300"
                  email="mnantongo@bugemauniv.ac.ug"
                  phone="+256-414-351462"
                />
                <FacultyCard
                  name="Dr. Peter Ssekandi"
                  title="Lecturer"
                  specialization="Science Education"
                  image="/placeholder.svg?height=300&width=300"
                  email="pssekandi@bugemauniv.ac.ug"
                  phone="+256-414-351463"
                />
                <FacultyCard
                  name="Ms. Ruth Nambi"
                  title="Assistant Lecturer"
                  specialization="Early Childhood Education"
                  image="/placeholder.svg?height=300&width=300"
                  email="rnambi@bugemauniv.ac.ug"
                  phone="+256-414-351464"
                />
                <FacultyCard
                  name="Mr. Joseph Lubega"
                  title="Assistant Lecturer"
                  specialization="Special Needs Education"
                  image="/placeholder.svg?height=300&width=300"
                  email="jlubega@bugemauniv.ac.ug"
                  phone="+256-414-351465"
                />
              </div>
            </TabsContent>

            <TabsContent value="health" className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FacultyCard
                  name="Dr. Agnes Kisakye"
                  title="Dean, School of Health Sciences"
                  specialization="Public Health"
                  image="/placeholder.svg?height=300&width=300"
                  email="akisakye@bugemauniv.ac.ug"
                  phone="+256-414-351470"
                />
                <FacultyCard
                  name="Dr. Michael Ssentamu"
                  title="Associate Professor"
                  specialization="Nursing Science"
                  image="/placeholder.svg?height=300&width=300"
                  email="mssentamu@bugemauniv.ac.ug"
                  phone="+256-414-351471"
                />
                <FacultyCard
                  name="Dr. Patricia Nakanjako"
                  title="Senior Lecturer"
                  specialization="Epidemiology"
                  image="/placeholder.svg?height=300&width=300"
                  email="pnakanjako@bugemauniv.ac.ug"
                  phone="+256-414-351472"
                />
                <FacultyCard
                  name="Dr. Timothy Mugisha"
                  title="Lecturer"
                  specialization="Medical Laboratory Science"
                  image="/placeholder.svg?height=300&width=300"
                  email="tmugisha@bugemauniv.ac.ug"
                  phone="+256-414-351473"
                />
              </div>
            </TabsContent>

            <TabsContent value="technology" className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FacultyCard
                  name="Dr. Richard Ssemakula"
                  title="Dean, School of Technology"
                  specialization="Computer Science"
                  image="/placeholder.svg?height=300&width=300"
                  email="rssemakula@bugemauniv.ac.ug"
                  phone="+256-414-351480"
                />
                <FacultyCard
                  name="Dr. Esther Nansubuga"
                  title="Associate Professor"
                  specialization="Software Engineering"
                  image="/placeholder.svg?height=300&width=300"
                  email="enansubuga@bugemauniv.ac.ug"
                  phone="+256-414-351481"
                />
                <FacultyCard
                  name="Dr. Benjamin Wasswa"
                  title="Senior Lecturer"
                  specialization="Information Systems"
                  image="/placeholder.svg?height=300&width=300"
                  email="bwasswa@bugemauniv.ac.ug"
                  phone="+256-414-351482"
                />
                <FacultyCard
                  name="Ms. Diana Namukasa"
                  title="Lecturer"
                  specialization="Cybersecurity"
                  image="/placeholder.svg?height=300&width=300"
                  email="dnamukasa@bugemauniv.ac.ug"
                  phone="+256-414-351483"
                />
              </div>
            </TabsContent>

            <TabsContent value="humanities" className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FacultyCard
                  name="Dr. Andrew Muwonge"
                  title="Dean, School of Humanities"
                  specialization="Development Studies"
                  image="/placeholder.svg?height=300&width=300"
                  email="amuwonge@bugemauniv.ac.ug"
                  phone="+256-414-351490"
                />
                <FacultyCard
                  name="Dr. Catherine Nakabugo"
                  title="Associate Professor"
                  specialization="Social Work"
                  image="/placeholder.svg?height=300&width=300"
                  email="cnakabugo@bugemauniv.ac.ug"
                  phone="+256-414-351491"
                />
                <FacultyCard
                  name="Dr. Paul Ssekamatte"
                  title="Senior Lecturer"
                  specialization="Communication"
                  image="/placeholder.svg?height=300&width=300"
                  email="pssekamatte@bugemauniv.ac.ug"
                  phone="+256-414-351492"
                />
              </div>
            </TabsContent>

            <TabsContent value="science" className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FacultyCard
                  name="Dr. Florence Nakimuli"
                  title="Dean, School of Science"
                  specialization="Environmental Science"
                  image="/placeholder.svg?height=300&width=300"
                  email="fnakimuli@bugemauniv.ac.ug"
                  phone="+256-414-351495"
                />
                <FacultyCard
                  name="Dr. George Lubwama"
                  title="Associate Professor"
                  specialization="Agriculture"
                  image="/placeholder.svg?height=300&width=300"
                  email="glubwama@bugemauniv.ac.ug"
                  phone="+256-414-351496"
                />
                <FacultyCard
                  name="Dr. Irene Namakula"
                  title="Senior Lecturer"
                  specialization="Mathematics"
                  image="/placeholder.svg?height=300&width=300"
                  email="inamakula@bugemauniv.ac.ug"
                  phone="+256-414-351497"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Join Our Faculty</h2>
          <p className="text-gray-700 mb-6">
            Bugema University is always looking for talented and dedicated educators to join our academic community. If
            you are passionate about teaching and research, we invite you to explore career opportunities with us.
          </p>

          <Button asChild>
            <Link href="/careers/academic-positions">View Academic Positions</Link>
          </Button>
        </div>
      </div>
    </AcademicsLayout>
  )
}

function FacultyCard({
  name,
  title,
  specialization,
  image,
  email,
  phone,
}: {
  name: string
  title: string
  specialization: string
  image: string
  email: string
  phone: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <CardTitle className="text-center text-lg">{name}</CardTitle>
        <CardDescription className="text-center">{title}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm font-medium mb-4">Specialization: {specialization}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{email}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{phone}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/academics/faculty/${name.toLowerCase().replace(/\s+/g, "-")}`}>
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
