import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, GraduationCap, BookOpen, Users, Globe, Award, ArrowRight } from "lucide-react"
import { SiteLayout } from "@/components/site/site-layout"

export default function Home() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Welcome to Bugema University</h2>
            <p className="text-lg md:text-xl mb-6">
              Empowering minds, transforming lives through excellence in education since 1948.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-yellow-500 text-[#1e3a8a] hover:bg-yellow-400">
                  Apply Now
                </Button>
              </Link>
              <Link href="/academics">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Programs
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="/campus.jpg"
              alt="Bugema University Campus"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Announcement Banner */}
      <div className="bg-yellow-500 text-[#1e3a8a] py-3">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="font-medium">
            <span className="font-bold">Announcement:</span> Applications for the Fall 2023 semester are now open!
          </p>
          <Link href="/admissions/apply" className="mt-2 md:mt-0 flex items-center hover:underline">
            Learn more <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Bugema University</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide a holistic education that nurtures intellectual, physical, social, and spiritual growth in a
              Christian environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <GraduationCap className="h-10 w-10 text-blue-700" />,
                title: "Quality Education",
                description:
                  "Accredited programs taught by experienced faculty members dedicated to academic excellence.",
              },
              {
                icon: <BookOpen className="h-10 w-10 text-blue-700" />,
                title: "Diverse Programs",
                description: "Wide range of undergraduate and graduate programs across various disciplines.",
              },
              {
                icon: <Users className="h-10 w-10 text-blue-700" />,
                title: "Supportive Community",
                description: "Inclusive environment that fosters personal growth and lifelong friendships.",
              },
              {
                icon: <Globe className="h-10 w-10 text-blue-700" />,
                title: "Global Perspective",
                description: "International partnerships and diverse student body from over 20 countries.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular academic programs designed to prepare you for success in your chosen field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Business Administration",
                description: "Develop essential business skills and knowledge for today's global marketplace.",
                image: "/images/business.jpg",
                link: "/academics/undergraduate/business",
              },
              {
                title: "Computer Science",
                description: "Learn cutting-edge technologies and software development practices.",
                image: "/images/computer-science.jpg",
                link: "/academics/undergraduate/computer-science",
              },
              {
                title: "Education",
                description: "Prepare for a rewarding career shaping the minds of future generations.",
                image: "/images/education.jpg",
                link: "/academics/undergraduate/education",
              },
            ].map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-48 relative">
                  <Image
                    src={program.image || `/placeholder.svg?height=192&width=384`}
                    alt={program.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <Link
                    href={program.link}
                    className="text-blue-700 flex items-center gap-1 hover:underline font-medium"
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/academics">
              <Button className="bg-blue-700 hover:bg-blue-800">
                View All Programs <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay connected with the latest happenings and activities at Bugema University.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Orientation Week",
                date: "September 18, 2023",
                time: "9:00 AM - 4:00 PM",
                location: "Main Auditorium",
                description: "Welcome event for new students to get acquainted with the university.",
              },
              {
                title: "Career Fair",
                date: "September 25, 2023",
                time: "10:00 AM - 3:00 PM",
                location: "University Grounds",
                description: "Connect with potential employers and explore career opportunities.",
              },
              {
                title: "Guest Lecture: AI in Education",
                date: "October 5, 2023",
                time: "2:00 PM - 4:00 PM",
                location: "Science Building, Room 302",
                description: "Learn about the impact of artificial intelligence on modern education.",
              },
            ].map((event, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-blue-700 font-semibold mb-2">{event.date}</div>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <div className="text-gray-600 mb-4">
                  <p>{event.time}</p>
                  <p>{event.location}</p>
                </div>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <Link href="/events" className="text-blue-700 flex items-center gap-1 hover:underline font-medium">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/events">
              <Button variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-50">
                View All Events <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our students about their experiences at Bugema University.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Bugema University provided me with not just academic knowledge, but also valuable life skills that have been crucial in my career.",
                name: "Sarah Nakato",
                title: "Business Administration Graduate, 2021",
                image: "/images/testimonial1.jpg",
              },
              {
                quote:
                  "The supportive community and dedicated professors at Bugema helped me achieve my academic goals and prepared me for the professional world.",
                name: "David Ochieng",
                title: "Computer Science Graduate, 2020",
                image: "/images/testimonial2.jpg",
              },
              {
                quote:
                  "My experience at Bugema University was transformative. The holistic education approach helped me grow intellectually and spiritually.",
                name: "Rebecca Mutumba",
                title: "Education Graduate, 2022",
                image: "/images/testimonial3.jpg",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden relative mr-4">
                    <Image
                      src={testimonial.image || `/placeholder.svg?height=48&width=48`}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Begin Your Journey at Bugema University</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Take the first step towards a bright future with quality education that transforms lives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-yellow-500 text-[#1e3a8a] hover:bg-yellow-400">
                Apply Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Student Portal", link: "/auth/login" },
              { title: "Academic Calendar", link: "/academics/calendar" },
              { title: "Library Resources", link: "/resources/library" },
              { title: "Campus Life", link: "/campus-life" },
              { title: "Admissions", link: "/admissions" },
              { title: "Research", link: "/research" },
              { title: "Alumni", link: "/alumni" },
              { title: "Careers", link: "/careers" },
            ].map((link, index) => (
              <Link
                key={index}
                href={link.link}
                className="bg-gray-100 p-4 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Awards and Accreditations */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Awards & Accreditations</h2>
            <p className="text-gray-600">Recognized for excellence in higher education</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-center">
                <Award className="h-12 w-12 text-blue-700" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
