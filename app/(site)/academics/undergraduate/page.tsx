import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AcademicsLayout } from "@/components/site/academics-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BookOpen, Users, Clock, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Undergraduate Programs | Bugema University",
  description: "Explore our diverse range of undergraduate degree programs designed to prepare you for success.",
}

export default function UndergraduatePage() {
  return (
    <AcademicsLayout
      title="Undergraduate Programs"
      description="Discover our comprehensive range of undergraduate programs designed to prepare you for success in your chosen field."
      breadcrumbTitle="Undergraduate Programs"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Undergraduate Education at Bugema University</h2>
          <p className="text-gray-700 mb-6">
            At Bugema University, we offer a wide range of undergraduate programs designed to provide students with a
            solid foundation in their chosen field of study. Our programs combine theoretical knowledge with practical
            skills, preparing graduates for successful careers or further academic pursuits.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Quality Education</h3>
                <p className="text-gray-700">
                  Our programs are designed to meet international standards and are regularly reviewed to ensure
                  relevance.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Experienced Faculty</h3>
                <p className="text-gray-700">
                  Learn from experienced professors who are experts in their fields and dedicated to student success.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Flexible Learning</h3>
                <p className="text-gray-700">
                  Choose from various study options including full-time, part-time, and evening programs.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Accredited Programs</h3>
                <p className="text-gray-700">
                  All our programs are accredited by the National Council for Higher Education (NCHE).
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Students in a lecture hall"
              fill
              className="object-cover"
            />
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
              <ProgramCard
                title="Bachelor of Business Administration"
                description="Develop essential business skills and knowledge to succeed in various business environments."
                duration="4 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Bachelor of Commerce"
                description="Gain comprehensive knowledge in accounting, finance, and business management."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Procurement & Supply Chain Management"
                description="Learn to manage supply chains and procurement processes efficiently."
                duration="4 Years"
                delivery="Full-time/Weekend"
              />
              <ProgramCard
                title="Bachelor of Office & Information Management"
                description="Develop skills in office administration, information management, and organizational communication."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Human Resource Management"
                description="Learn to effectively manage human capital in organizations."
                duration="4 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Bachelor of Entrepreneurship"
                description="Develop skills to start and grow successful business ventures."
                duration="4 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="education" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Bachelor of Arts in Education"
                description="Prepare for a career in teaching humanities and social sciences subjects."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Science in Education"
                description="Prepare to teach mathematics and science subjects in secondary schools."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Early Childhood Education"
                description="Develop skills to educate and nurture young children effectively."
                duration="4 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="health" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Bachelor of Nursing Science"
                description="Develop comprehensive nursing skills for various healthcare settings."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Public Health"
                description="Learn to address public health challenges through prevention and promotion."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Medical Laboratory Science"
                description="Gain skills in laboratory techniques for diagnosis and research."
                duration="4 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="technology" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Bachelor of Information Technology"
                description="Develop skills in various IT domains including programming, networking, and systems analysis."
                duration="4 Years"
                delivery="Full-time/Evening"
              />
              <ProgramCard
                title="Bachelor of Computer Science"
                description="Gain in-depth knowledge of computing principles and programming."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Software Engineering"
                description="Learn to design, develop, and maintain software systems."
                duration="4 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="humanities" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Bachelor of Arts in Development Studies"
                description="Understand social, economic, and political aspects of development."
                duration="3 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Social Work"
                description="Develop skills to help individuals, families, and communities overcome challenges."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Arts in Communication"
                description="Learn effective communication strategies for various media platforms."
                duration="3 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>

          <TabsContent value="science" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Bachelor of Science in Agriculture"
                description="Gain knowledge and skills in modern agricultural practices and management."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Environmental Science"
                description="Study environmental systems and develop solutions for environmental challenges."
                duration="4 Years"
                delivery="Full-time"
              />
              <ProgramCard
                title="Bachelor of Science in Mathematics"
                description="Develop advanced mathematical skills applicable in various fields."
                duration="3 Years"
                delivery="Full-time"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Admission Requirements</h2>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Uganda Advanced Certificate of Education (UACE) with at least 2 principal passes</li>
            <li>Uganda Certificate of Education (UCE) with at least 5 passes</li>
            <li>Equivalent qualifications from recognized examination bodies</li>
            <li>Mature age entry (for applicants 25 years and above)</li>
            <li>Diploma holders may apply for admission with advanced standing</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/admissions">Apply Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admissions">View Detailed Requirements</Link>
            </Button>
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
