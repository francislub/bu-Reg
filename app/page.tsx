import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Users, Award, Calculator, Calendar, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-blue-900 text-white py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-2xl font-bold">BUGEMA UNIVERSITY</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="text-white border-white hover:bg-blue-800">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-blue-800 text-white py-20">
          <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge className="mb-4 bg-green-600 hover:bg-green-700">Est. 1948</Badge>
            <h2 className="text-4xl font-bold mb-6">Comprehensive Course Registration System</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              A modern platform connecting students, staff, and administrative departments for efficient academic
              management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Announcement Section */}
        <section className="bg-yellow-50 py-4 border-y border-yellow-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-4 bg-yellow-100 text-yellow-800 border-yellow-200">
                Announcement
              </Badge>
              <div className="text-sm md:text-base">
                Registration for the Spring 2023 semester is now open until April 30, 2023
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-yellow-800" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="For Students"
                description="Register for courses, track approval status, and print registration cards. View your class timetables and monitor attendance."
                icon={<BookOpen className="h-10 w-10 text-blue-600" />}
              />
              <FeatureCard
                title="For Staff"
                description="Approve student registrations, manage department courses, and view analytics. Create and manage attendance sessions."
                icon={<Users className="h-10 w-10 text-blue-600" />}
              />
              <FeatureCard
                title="For Registrars"
                description="Manage course catalog, set deadlines, generate comprehensive reports, and create timetables for courses and departments."
                icon={<Calculator className="h-10 w-10 text-blue-600" />}
              />
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Benefits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BenefitCard
                icon={<Calendar className="h-8 w-8 text-green-600" />}
                title="Smart Timetabling"
                description="Comprehensive timetables for students and lecturers with automatic conflict detection"
              />
              <BenefitCard
                icon={<Clock className="h-8 w-8 text-green-600" />}
                title="Attendance Tracking"
                description="Track and monitor class attendance with detailed statistics and reports"
              />
              <BenefitCard
                icon={<Award className="h-8 w-8 text-green-600" />}
                title="Academic Progress"
                description="Easily monitor student performance and academic history"
              />
              <BenefitCard
                icon={<GraduationCap className="h-8 w-8 text-green-600" />}
                title="Graduation Tracking"
                description="Stay on track with graduation requirements and progress indicators"
              />
            </div>
          </div>
        </section>

        {/* About University Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6">About Bugema University</h2>
                <p className="text-gray-600 mb-4">
                  Founded in 1948, Bugema University is a premier institution of higher learning in Uganda, offering a
                  wide range of undergraduate and graduate programs across various disciplines.
                </p>
                <p className="text-gray-600 mb-6">
                  Our mission is to provide quality Christian education that prepares graduates with relevant skills,
                  knowledge, and values for service to God and humanity.
                </p>
                <Link href="/about">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/placeholder.svg?height=720&width=1280"
                    alt="Bugema University Campus"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-900/20"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="The new course registration system has made my academic planning so much easier. I can see my timetable and track my attendance all in one place."
                name="Sarah Nakato"
                role="Computer Science Student"
              />
              <TestimonialCard
                quote="As a lecturer, I appreciate how easy it is to track attendance and manage my course schedules. The interface is intuitive and saves me hours of administrative work."
                name="Dr. James Mulondo"
                role="Business Administration Faculty"
              />
              <TestimonialCard
                quote="The reporting features have revolutionized how we manage enrollment and academic planning. The system provides valuable insights for institutional decision-making."
                name="Mrs. Elizabeth Ssekandi"
                role="University Registrar"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students and staff already using our platform for seamless academic management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Register Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-800">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Bugema University</h3>
              <p className="text-sm text-gray-300">Providing quality education since 1948</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-gray-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Academic Programs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Admissions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Campus Life
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white">
                    Research
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <address className="text-sm text-gray-300 not-italic">
                <p>Bugema University</p>
                <p>P.O. Box 6529, Kampala</p>
                <p>Uganda</p>
                <p className="mt-2">Email: info@bugemauniv.ac.ug</p>
                <p>Phone: +256 414 351400</p>
              </address>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Hours</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>Monday - Thursday: 8am - 5pm</li>
                <li>Friday: 8am - 12pm</li>
                <li>Saturday - Sunday: Closed</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>© {new Date().getFullYear()} Bugema University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="text-blue-600 mb-4">"</div>
        <p className="text-gray-700 mb-6 italic">{quote}</p>
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}
