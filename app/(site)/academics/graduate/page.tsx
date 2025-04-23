import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AcademicsLayout } from "@/components/site/academics-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, BookOpen, Users, Clock, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Graduate Programs | Bugema University",
  description: "Advance your career with our graduate programs designed for working professionals and researchers.",
}

export default function GraduatePage() {
  return (
    <AcademicsLayout
      title="Graduate Programs"
      description="Take your education to the next level with our advanced graduate programs designed for professionals and researchers."
      breadcrumbTitle="Graduate Programs"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Graduate Education at Bugema University</h2>
          <p className="text-gray-700 mb-6">
            Bugema University offers a range of graduate programs designed to provide advanced knowledge and skills for
            professionals seeking to enhance their careers or pursue academic research. Our graduate programs are
            designed with flexibility to accommodate working professionals while maintaining academic rigor and
            excellence.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Advanced Specialization</h3>
                <p className="text-gray-700">
                  Develop expertise in specialized areas of your field with advanced coursework and research.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Expert Faculty</h3>
                <p className="text-gray-700">
                  Learn from professors with extensive academic and professional experience in their fields.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Flexible Scheduling</h3>
                <p className="text-gray-700">
                  Programs designed to accommodate working professionals with evening and weekend classes.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex items-start gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Research Opportunities</h3>
                <p className="text-gray-700">
                  Engage in meaningful research that contributes to knowledge in your field.
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Graduate students in a seminar"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <Tabs defaultValue="masters" className="w-full">
          <TabsList className="grid grid-cols-2 h-auto">
            <TabsTrigger value="masters" className="py-3">
              Master's Programs
            </TabsTrigger>
            <TabsTrigger value="doctoral" className="py-3">
              Doctoral Programs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="masters" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="Master of Business Administration (MBA)"
                description="Develop advanced business management skills and strategic thinking for leadership roles."
                duration="2 Years"
                delivery="Evening/Weekend"
                specializations={["General Management", "Finance", "Marketing", "Human Resource Management"]}
              />
              <ProgramCard
                title="Master of Education"
                description="Advance your knowledge in educational theory, research, and practice."
                duration="2 Years"
                delivery="Evening/Weekend"
                specializations={["Educational Administration", "Curriculum Studies", "Guidance and Counseling"]}
              />
              <ProgramCard
                title="Master of Public Health"
                description="Develop skills to address public health challenges through research, policy, and practice."
                duration="2 Years"
                delivery="Full-time/Weekend"
                specializations={["Epidemiology", "Health Promotion", "Health Systems Management"]}
              />
              <ProgramCard
                title="Master of Information Technology"
                description="Advance your IT skills with specialized knowledge in emerging technologies."
                duration="2 Years"
                delivery="Evening/Weekend"
                specializations={["Cybersecurity", "Data Science", "Software Engineering"]}
              />
              <ProgramCard
                title="Master of Arts in Development Studies"
                description="Analyze development challenges and design effective interventions."
                duration="2 Years"
                delivery="Evening/Weekend"
                specializations={["Rural Development", "Gender and Development", "Project Planning and Management"]}
              />
              <ProgramCard
                title="Master of Science in Agriculture"
                description="Develop advanced knowledge in agricultural science and sustainable practices."
                duration="2 Years"
                delivery="Full-time"
                specializations={["Crop Science", "Animal Science", "Agricultural Economics"]}
              />
            </div>
          </TabsContent>

          <TabsContent value="doctoral" className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProgramCard
                title="PhD in Business Administration"
                description="Conduct original research that contributes to business knowledge and practice."
                duration="3-5 Years"
                delivery="Research-based"
                specializations={["Strategic Management", "Finance", "Marketing", "Organizational Behavior"]}
              />
              <ProgramCard
                title="PhD in Education"
                description="Contribute to educational theory and practice through advanced research."
                duration="3-5 Years"
                delivery="Research-based"
                specializations={["Educational Leadership", "Curriculum and Instruction", "Educational Psychology"]}
              />
              <ProgramCard
                title="PhD in Public Health"
                description="Conduct research addressing critical public health challenges."
                duration="3-5 Years"
                delivery="Research-based"
                specializations={["Epidemiology", "Health Policy", "Community Health"]}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Admission Requirements</h2>

          <h3 className="text-xl font-semibold mb-2">Master's Programs</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Bachelor's degree (minimum Second Class) from a recognized university</li>
            <li>Relevant work experience (program-specific requirements may apply)</li>
            <li>Letters of recommendation</li>
            <li>Statement of purpose</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Doctoral Programs</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Master's degree in a relevant field from a recognized university</li>
            <li>Research proposal</li>
            <li>Academic writing sample</li>
            <li>Letters of recommendation</li>
            <li>Interview with the departmental committee</li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/admissions/graduate-apply">Apply Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admissions/graduate-requirements">View Detailed Requirements</Link>
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
  specializations,
}: {
  title: string
  description: string
  duration: string
  delivery: string
  specializations: string[]
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
          {specializations.length > 0 && (
            <div>
              <span className="font-medium">Specializations:</span>
              <ul className="list-disc pl-5 mt-1 text-sm">
                {specializations.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}
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
