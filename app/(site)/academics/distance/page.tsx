import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { AcademicsLayout } from "@/components/site/academics-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Laptop, Calendar, FileText, Users, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Distance Learning | Bugema University",
  description: "Flexible online and distance learning programs that fit your schedule and location.",
}

export default function DistanceLearningPage() {
  return (
    <AcademicsLayout
      title="Distance Learning"
      description="Flexible education options that allow you to study from anywhere while balancing work and other commitments."
      breadcrumbTitle="Distance Learning"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Distance Learning at Bugema University</h2>
          <p className="text-gray-700 mb-6">
            Our distance learning programs offer flexible study options for students who cannot attend regular on-campus
            classes. Through a combination of online learning platforms, weekend sessions, and study centers across the
            country, we provide quality education that fits your schedule and location.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                <Laptop className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Online Learning</h3>
              <p className="text-gray-700">
                Access course materials, lectures, and assignments through our digital learning platform.
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Flexible Schedule</h3>
              <p className="text-gray-700">
                Study at your own pace with flexible deadlines that accommodate your work schedule.
              </p>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Quality Materials</h3>
              <p className="text-gray-700">
                Receive comprehensive study materials designed specifically for distance learners.
              </p>
            </div>
          </div>

          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Student studying online"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Available Distance Learning Programs</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProgramCard
              title="Bachelor of Business Administration"
              description="Develop essential business skills and knowledge through our flexible distance learning format."
              duration="4-5 Years"
              studyCenters={["Kampala", "Mbale", "Mbarara", "Gulu"]}
            />
            <ProgramCard
              title="Bachelor of Education"
              description="Prepare for a teaching career while continuing to work through our distance education program."
              duration="4-5 Years"
              studyCenters={["Kampala", "Mbale", "Mbarara", "Arua"]}
            />
            <ProgramCard
              title="Bachelor of Development Studies"
              description="Study social and economic development through our accessible distance learning format."
              duration="3-4 Years"
              studyCenters={["Kampala", "Mbale", "Gulu"]}
            />
            <ProgramCard
              title="Diploma in Business Administration"
              description="Gain practical business skills through our flexible diploma program."
              duration="2-3 Years"
              studyCenters={["Kampala", "Mbale", "Mbarara", "Gulu", "Arua"]}
            />
            <ProgramCard
              title="Diploma in Education"
              description="Enhance your teaching qualifications through our accessible diploma program."
              duration="2-3 Years"
              studyCenters={["Kampala", "Mbale", "Mbarara", "Gulu", "Arua"]}
            />
            <ProgramCard
              title="Master of Business Administration"
              description="Advance your business career with our flexible MBA program designed for working professionals."
              duration="2-3 Years"
              studyCenters={["Kampala", "Mbarara"]}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">How Distance Learning Works</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Learning Methods</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full mt-1">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Online Learning Platform</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Access course materials, submit assignments, and participate in discussions through our digital
                      learning environment.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full mt-1">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Study Materials</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Receive comprehensive printed and digital study materials designed for self-paced learning.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full mt-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Weekend Sessions</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Attend occasional weekend sessions at study centers for face-to-face interaction with instructors
                      and peers.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full mt-1">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">Virtual Support</span>
                    <p className="text-gray-600 text-sm mt-1">
                      Access tutoring and academic support through video conferencing, email, and phone.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Study Centers</h3>
              <p className="text-gray-700 mb-4">
                Our study centers provide local support for distance learners, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Face-to-face tutorials on selected weekends</li>
                <li>Library and computer resources</li>
                <li>Examination venues</li>
                <li>Administrative support</li>
                <li>Peer interaction opportunities</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Study Center Locations:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">Kampala (Main)</div>
                <div className="bg-gray-50 p-2 rounded">Mbale</div>
                <div className="bg-gray-50 p-2 rounded">Mbarara</div>
                <div className="bg-gray-50 p-2 rounded">Gulu</div>
                <div className="bg-gray-50 p-2 rounded">Arua</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I submit assignments?</AccordionTrigger>
              <AccordionContent>
                Assignments are submitted through our online learning platform. You can upload documents, images, or
                other required files. Some courses may also require physical submission at study centers for certain
                assignments.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How are examinations conducted?</AccordionTrigger>
              <AccordionContent>
                Examinations are conducted at designated study centers. You will be informed about examination dates and
                venues well in advance. You must be physically present at the examination center with your student ID.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>What technology do I need for distance learning?</AccordionTrigger>
              <AccordionContent>
                You will need regular access to a computer or tablet with internet connectivity. Basic computer skills
                are necessary to navigate the online learning platform. Some courses may require specific software which
                will be communicated to you upon enrollment.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How long does it take to complete a distance learning program?</AccordionTrigger>
              <AccordionContent>
                The duration varies by program. Bachelor's programs typically take 4-5 years, diplomas 2-3 years, and
                master's programs 2-3 years. However, one of the benefits of distance learning is flexibility, so you
                may be able to complete your program faster or slower depending on your pace.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Are distance learning degrees recognized?</AccordionTrigger>
              <AccordionContent>
                Yes, all our distance learning programs are fully accredited by the National Council for Higher
                Education (NCHE). The degrees awarded are identical to those earned through on-campus study and are
                recognized nationally and internationally.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-700 mb-6">
            Take the next step in your education journey with our flexible distance learning programs. Applications are
            accepted throughout the year with multiple intake periods.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/admissions/distance-apply">Apply Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admissions/distance-requirements">View Requirements</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact an Advisor</Link>
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
  studyCenters,
}: {
  title: string
  description: string
  duration: string
  studyCenters: string[]
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
          <div>
            <span className="font-medium">Available at:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {studyCenters.map((center, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                  {center}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/academics/programs/${title.toLowerCase().replace(/\s+/g, "-")}-distance`}>
            Program Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
