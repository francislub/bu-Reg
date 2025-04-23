import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AcademicsLayout } from "@/components/site/academics-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BookOpen, Users, Clock, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Diploma Programs | Bugema University",
  description:
    "Explore our diploma programs designed to provide practical skills and knowledge for career advancement.",
}

export default function DiplomaPage() {
  return (
    <AcademicsLayout
      title="Diploma Programs"
      description="Practical, career-focused diploma programs designed to equip you with relevant skills for the job market."
      breadcrumbTitle="Diploma Programs"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Diploma Education at Bugema University</h2>
          <p className="text-gray-700 mb-6">
            Our diploma programs are designed to provide practical skills and knowledge that prepare students for the
            workforce or further education. These programs combine theoretical learning with hands-on experience,
            ensuring graduates are job-ready and competent in their chosen fields.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Practical Training</h3>
                <p className="text-gray-700">
                  Our programs emphasize hands-on learning and practical skills development.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Industry Connections</h3>
                <p className="text-gray-700">
                  Programs are designed with input from industry partners to ensure relevance.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Shorter Duration</h3>
                <p className="text-gray-700">
                  Complete your education in a shorter timeframe and enter the workforce sooner.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Pathway to Degrees</h3>
                <p className="text-gray-700">
                  Use your diploma as a stepping stone to a bachelor's degree with advanced standing.
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Students in a practical training session"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 h-auto">
            <TabsTrigger value="business" className="py-3">
              Business
            </TabsTrigger>
            <TabsTrigger value="education" className="py-3">
              Education
            </TabsTrigger>
            <TabsTrigger value="health" className="py-3">
              Health
            </TabsTrigger>
            <TabsTrigger value="technology" className="py-3">
              Technology
            </TabsTrigger>
            <TabsTrigger value="other" className="py-3">
              Other
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Diploma in Business Administration"
                description="Develop essential business management skills for entry-level positions in various organizations."
                duration="2 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Diploma in Accounting and Finance"
                description="Learn practical accounting skills and financial management techniques."
                duration="2 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Diploma in Marketing"
                description="Gain practical marketing skills for the modern business environment."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Human Resource Management"
                description="Develop skills in personnel management and organizational development."
                duration="2 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Diploma in Procurement and Logistics"
                description="Learn practical skills in supply chain management and procurement."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Secretarial Studies"
                description="Develop office management and administrative support skills."
                duration="2 Years"
                delivery="Full-time/Evening"
              />
            </div>
          </TabsContent>

          <TabsContent value="education" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Diploma in Education (Primary)"
                description="Prepare for a teaching career in primary schools with practical teaching methods."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Education (Secondary)"
                description="Develop teaching skills for secondary school subjects."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Early Childhood Education"
                description="Learn specialized skills for teaching and caring for young children."
                duration="2 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="health" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Diploma in Clinical Medicine"
                description="Develop practical skills in clinical diagnosis and treatment."
                duration="3 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Nursing"
                description="Learn essential nursing skills for healthcare settings."
                duration="3 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Medical Laboratory Technology"
                description="Gain practical skills in laboratory techniques and procedures."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Public Health"
                description="Learn to implement public health interventions and programs."
                duration="2 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="technology" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Diploma in Information Technology"
                description="Develop practical IT skills for technical support and system administration."
                duration="2 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Diploma in Computer Science"
                description="Learn programming and software development fundamentals."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Networking and Systems Administration"
                description="Gain skills in network setup, maintenance, and system administration."
                duration="2 Years"
                delivery="Full-time/Evening"
              />
            </div>
          </TabsContent>

          <TabsContent value="other" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Diploma in Agriculture"
                description="Learn practical farming techniques and agricultural management."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Social Work"
                description="Develop skills to support individuals and communities in need."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Journalism and Mass Communication"
                description="Learn practical media production and communication skills."
                duration="2 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Diploma in Tourism and Hospitality Management"
                description="Gain practical skills for the tourism and hospitality industry."
                duration="2 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Admission Requirements</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Uganda Certificate of Education (UCE) with at least 5 passes</li>
            <li>Uganda Advanced Certificate of Education (UACE) with at least 1 principal pass (for some programs)</li>
            <li>Equivalent qualifications from recognized examination bodies</li>
            <li>Mature age entry (for applicants 25 years and above)</li>
            <li>Certificate holders in relevant fields may apply for advanced standing</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/admissions/apply">Apply Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admissions/requirements">View Detailed Requirements</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Pathway to Degree Programs</h2>
          <p className="text-gray-700 mb-6">
            Diploma graduates can continue their education by applying for admission to relevant bachelor's degree
            programs with advanced standing. This means you may be exempted from certain courses based on your diploma
            studies, allowing you to complete your degree in a shorter time.
          </p>

          <div className="relative h-[250px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=500&width=1200"
              alt="Graduation ceremony"
              fill
              className="object-cover"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Benefits of the Diploma-to-Degree Pathway:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Reduced time to complete a bachelor's degree</li>
              <li>Cost savings on tuition and related expenses</li>
              <li>Opportunity to enter the workforce sooner with a diploma qualification</li>
              <li>Flexibility to work while continuing education part-time</li>
              <li>Practical skills from diploma studies complement theoretical knowledge in degree programs</li>
            </ul>
          </div>
        </div>
      </div>
    </AcademicsLayout>
  )
}

function ProgramCard({
  title,
  description,
  duration,
  delivery,
}: {
  title: string
  description: string
  duration: string
  delivery: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span>
            <span>{duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Delivery Mode:</span>
            <span>{delivery}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/academics/programs/${title.toLowerCase().replace(/\s+/g, "-")}`}>
            Program Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
