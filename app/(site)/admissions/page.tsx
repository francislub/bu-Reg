import Image from "next/image"
import type { Metadata } from "next"
import { Calendar, CheckCircle, Clock, FileText, GraduationCap, HelpCircle, MapPin, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Admissions | Bugema University",
  description: "Information about admissions process, requirements, and deadlines at Bugema University",
}

const admissionSteps = [
  {
    title: "Research Programs",
    description: "Explore our academic programs to find the one that matches your interests and career goals.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Check Requirements",
    description: "Review the admission requirements for your chosen program to ensure you qualify.",
    icon: <CheckCircle className="h-6 w-6" />,
  },
  {
    title: "Submit Application",
    description: "Complete the online application form and submit all required documents.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    title: "Application Review",
    description: "Our admissions committee will review your application and credentials.",
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Admission Decision",
    description: "You will receive notification of the admission decision via email.",
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    title: "Accept Offer & Enroll",
    description: "If accepted, confirm your place and complete the enrollment process.",
    icon: <CheckCircle className="h-6 w-6" />,
  },
]

const importantDates = [
  {
    term: "January Intake",
    applicationDeadline: "November 15",
    admissionDecisions: "December 10",
    registrationDeadline: "January 5",
    classesBegin: "January 15",
  },
  {
    term: "May Intake",
    applicationDeadline: "March 15",
    admissionDecisions: "April 10",
    registrationDeadline: "May 5",
    classesBegin: "May 15",
  },
  {
    term: "September Intake",
    applicationDeadline: "July 15",
    admissionDecisions: "August 10",
    registrationDeadline: "September 5",
    classesBegin: "September 15",
  },
]

const faqItems = [
  {
    question: "What are the minimum academic requirements for admission?",
    answer:
      "For undergraduate programs, applicants typically need a high school diploma or equivalent with a minimum GPA of 2.5 on a 4.0 scale. For graduate programs, a bachelor's degree with a minimum GPA of 3.0 is usually required. Specific programs may have additional requirements.",
  },
  {
    question: "Is there an application fee?",
    answer:
      "Yes, there is a non-refundable application fee of UGX 50,000 for domestic students and USD 50 for international students. This fee must be paid when submitting your application.",
  },
  {
    question: "How do I check the status of my application?",
    answer:
      "You can check your application status by logging into the applicant portal using the credentials you created when you submitted your application. The portal will show your current application status and any additional documents that may be required.",
  },
  {
    question: "Are there scholarships available for new students?",
    answer:
      "Yes, Bugema University offers various scholarships based on academic merit, financial need, and special talents. You can apply for scholarships after receiving an admission offer. Visit our financial aid page for more information on available scholarships and application deadlines.",
  },
  {
    question: "Do you accept transfer students?",
    answer:
      "Yes, we accept transfer students from accredited institutions. Transfer applicants must submit official transcripts from all previously attended institutions. Credits may be transferred if they meet our academic requirements and are relevant to your program of study.",
  },
  {
    question: "What documents are required for international students?",
    answer:
      "International students must submit academic transcripts, proof of English proficiency (TOEFL or IELTS scores), a copy of their passport, financial support documentation, and any program-specific requirements. All documents in languages other than English must be accompanied by certified translations.",
  },
  {
    question: "Is on-campus housing guaranteed for new students?",
    answer:
      "On-campus housing is not guaranteed but is available on a first-come, first-served basis. We recommend applying for housing as soon as you receive your admission offer to increase your chances of securing on-campus accommodation.",
  },
  {
    question: "Can I defer my admission to a later term?",
    answer:
      "Yes, admitted students may request to defer their admission for up to one academic year. Deferral requests must be submitted in writing to the Admissions Office and are considered on a case-by-case basis.",
  },
]

export default function AdmissionsPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Admissions</h1>
        <p className="text-xl text-muted-foreground">
          Your journey to becoming a Bugema University student starts here
        </p>
        <Separator />
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Begin Your Academic Journey</h2>
          <p className="text-muted-foreground">
            Bugema University welcomes applications from motivated students who are ready to challenge themselves
            academically and grow personally. Our admissions process is designed to identify students who will thrive in
            our diverse and supportive community.
          </p>
          <p className="text-muted-foreground">
            Whether you're a high school graduate, a transfer student, or a working professional seeking advanced
            education, we have programs to meet your needs and help you achieve your goals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg">Apply Now</Button>
            <Button variant="outline" size="lg">
              Request Information
            </Button>
          </div>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-lg md:h-[400px]">
          <Image src="/placeholder.svg?height=600&width=800" alt="Students on campus" fill className="object-cover" />
        </div>
      </div>

      <Tabs defaultValue="undergraduate">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="undergraduate">Undergraduate</TabsTrigger>
          <TabsTrigger value="graduate">Graduate</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>

        <TabsContent value="undergraduate" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Undergraduate Admission Requirements</CardTitle>
                <CardDescription>For first-year and transfer students</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Completed Secondary Education</p>
                      <p className="text-sm text-muted-foreground">
                        Uganda Advanced Certificate of Education (UACE) with at least 2 principal passes or equivalent
                        qualification
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Minimum Academic Performance</p>
                      <p className="text-sm text-muted-foreground">
                        Minimum of 10 points for Arts programs and 12 points for Science programs
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Application Documents</p>
                      <p className="text-sm text-muted-foreground">
                        Completed application form, certified copies of academic documents, copy of national ID or
                        passport, passport-sized photographs
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Application Fee</p>
                      <p className="text-sm text-muted-foreground">Non-refundable application fee of UGX 50,000</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply for Undergraduate Programs</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Students</CardTitle>
                <CardDescription>For students with previous college credits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Students who have completed coursework at other accredited institutions may apply to transfer to
                  Bugema University. In addition to the standard undergraduate requirements, transfer applicants must:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Submit Official Transcripts</p>
                      <p className="text-sm text-muted-foreground">
                        From all previously attended colleges or universities
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Good Academic Standing</p>
                      <p className="text-sm text-muted-foreground">
                        Minimum GPA of 2.5 on a 4.0 scale at previous institution
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Course Descriptions</p>
                      <p className="text-sm text-muted-foreground">For courses to be considered for transfer credit</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Transfer Credit Evaluation
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Undergraduate Application Process</CardTitle>
              <CardDescription>Follow these steps to apply for undergraduate programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {admissionSteps.map((step, index) => (
                  <div key={step.title} className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {index + 1}
                    </div>
                    <h3 className="mb-2 font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graduate" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Graduate Admission Requirements</CardTitle>
                <CardDescription>For master's and doctoral programs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Bachelor's Degree</p>
                      <p className="text-sm text-muted-foreground">
                        From an accredited institution in a relevant field of study
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Academic Performance</p>
                      <p className="text-sm text-muted-foreground">Minimum GPA of 3.0 on a 4.0 scale (or equivalent)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Letters of Recommendation</p>
                      <p className="text-sm text-muted-foreground">
                        Two letters from academic or professional references
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Statement of Purpose</p>
                      <p className="text-sm text-muted-foreground">Essay outlining academic and career goals</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Resume/CV</p>
                      <p className="text-sm text-muted-foreground">Detailing academic and professional experience</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Application Fee</p>
                      <p className="text-sm text-muted-foreground">Non-refundable fee of UGX 75,000</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply for Graduate Programs</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program-Specific Requirements</CardTitle>
                <CardDescription>Additional requirements for certain graduate programs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">Master of Business Administration (MBA)</h3>
                  <ul className="ml-6 list-disc text-sm text-muted-foreground">
                    <li>Minimum of two years of professional work experience</li>
                    <li>GMAT scores (may be waived for applicants with significant work experience)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Master of Education</h3>
                  <ul className="ml-6 list-disc text-sm text-muted-foreground">
                    <li>Teaching certificate or license</li>
                    <li>Evidence of classroom teaching experience</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Master of Public Health</h3>
                  <ul className="ml-6 list-disc text-sm text-muted-foreground">
                    <li>Background in health sciences or related field</li>
                    <li>Personal statement addressing public health interests</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">PhD Programs</h3>
                  <ul className="ml-6 list-disc text-sm text-muted-foreground">
                    <li>Master's degree in a relevant field</li>
                    <li>Research proposal</li>
                    <li>Interview with faculty committee</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Program-Specific Information
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="international" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>International Student Requirements</CardTitle>
                <CardDescription>Additional requirements for non-Ugandan applicants</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Academic Credentials</p>
                      <p className="text-sm text-muted-foreground">
                        Official transcripts and diplomas with certified English translations if originals are not in
                        English
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">English Proficiency</p>
                      <p className="text-sm text-muted-foreground">
                        TOEFL (minimum 550 paper-based, 80 internet-based) or IELTS (minimum 6.0) for non-native English
                        speakers
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Financial Documentation</p>
                      <p className="text-sm text-muted-foreground">
                        Proof of sufficient funds to cover tuition and living expenses for at least one academic year
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Copy of Passport</p>
                      <p className="text-sm text-muted-foreground">
                        Valid passport with at least six months validity beyond your intended period of stay
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Application Fee</p>
                      <p className="text-sm text-muted-foreground">Non-refundable application fee of USD 50</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">International Student Application</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visa and Immigration</CardTitle>
                <CardDescription>Information for international students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  After receiving your acceptance letter, you will need to apply for a student visa to study in Uganda.
                  Our International Student Office will provide guidance throughout this process.
                </p>

                <div>
                  <h3 className="mb-2 font-medium">Student Visa Requirements</h3>
                  <ul className="ml-6 list-disc text-sm text-muted-foreground">
                    <li>Acceptance letter from Bugema University</li>
                    <li>Completed visa application form</li>
                    <li>Passport valid for at least six months beyond your intended stay</li>
                    <li>Passport-sized photographs</li>
                    <li>Proof of financial support</li>
                    <li>Health insurance coverage</li>
                    <li>Visa application fee</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Arrival and Orientation</h3>
                  <p className="text-sm text-muted-foreground">
                    We recommend arriving at least one week before classes begin to participate in the international
                    student orientation program, which will help you adjust to life at Bugema University and in Uganda.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  International Student Guide
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>International Student Support</CardTitle>
              <CardDescription>Resources available to international students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="font-medium">International Student Office</h3>
                  <p className="text-sm text-muted-foreground">
                    Dedicated support for visa issues, cultural adjustment, and other concerns specific to international
                    students.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">English Language Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional language courses and tutoring available for non-native English speakers.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Cultural Integration Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Activities and events designed to help international students connect with the campus community.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Housing Assistance</h3>
                  <p className="text-sm text-muted-foreground">
                    Help finding suitable on-campus or off-campus accommodation.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Airport Pickup</h3>
                  <p className="text-sm text-muted-foreground">
                    Transportation from Entebbe International Airport to campus for new international students.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">International Student Association</h3>
                  <p className="text-sm text-muted-foreground">
                    Student-led organization that provides peer support and organizes cultural events.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-16 space-y-8">
        <h2 className="text-3xl font-bold">Important Dates & Deadlines</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-medium">Term</th>
                <th className="p-4 text-left font-medium">Application Deadline</th>
                <th className="p-4 text-left font-medium">Admission Decisions</th>
                <th className="p-4 text-left font-medium">Registration Deadline</th>
                <th className="p-4 text-left font-medium">Classes Begin</th>
              </tr>
            </thead>
            <tbody>
              {importantDates.map((term) => (
                <tr key={term.term} className="border-b">
                  <td className="p-4 font-medium">{term.term}</td>
                  <td className="p-4 text-muted-foreground">{term.applicationDeadline}</td>
                  <td className="p-4 text-muted-foreground">{term.admissionDecisions}</td>
                  <td className="p-4 text-muted-foreground">{term.registrationDeadline}</td>
                  <td className="p-4 text-muted-foreground">{term.classesBegin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-muted p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <p className="font-medium">Note on Deadlines</p>
          </div>
          <p className="mt-2 text-muted-foreground">
            We encourage applicants to submit their applications well before the deadlines. Late applications may be
            considered on a space-available basis, but financial aid and scholarship opportunities may be limited for
            late applicants.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-8 text-3xl font-bold">Frequently Asked Questions</h2>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Have More Questions? Contact Admissions
          </Button>
        </div>
      </div>

      <div className="mt-16 rounded-lg bg-primary p-8 text-primary-foreground">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Ready to Apply?</h2>
            <p className="mb-6">
              Take the first step toward your future at Bugema University. Our admissions team is ready to assist you
              throughout the application process.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg">
                Start Application
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Schedule a Campus Visit
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Contact Admissions</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-5 w-5" />
                <p>Admissions Office, Administration Building, Bugema University, Luweero District, Uganda</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-1 h-5 w-5" />
                <p>Monday to Friday: 8:00 AM - 5:00 PM</p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-1 h-5 w-5" />
                <p>Email: admissions@bugema.ac.ug</p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-1 h-5 w-5" />
                <p>Phone: +256-XXX-XXX-XXX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
