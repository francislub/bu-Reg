import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteLayout } from "@/components/site/site-layout"
import { ChevronRight, BookOpen, Globe, Heart, Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Bugema University</h1>
            <p className="text-xl mb-6">
              A Chartered Seventh-Day Adventist Institution of Higher Learning committed to excellence since 1948.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-blue-700 hover:underline">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>About</span>
          </div>
        </div>
      </div>

      {/* History Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our History</h2>
              <p className="text-gray-700 mb-4">
                Bugema University was established in 1948 as a missionary training school for the Seventh-day Adventist
                Church in East Africa. Over the decades, it has evolved into a comprehensive institution of higher
                learning, earning its charter in 2014.
              </p>
              <p className="text-gray-700 mb-4">
                What began as a small training center has grown into one of Uganda's premier private universities,
                offering a wide range of undergraduate and graduate programs across various disciplines.
              </p>
              <p className="text-gray-700">
                Throughout its history, Bugema University has remained committed to its founding principles of providing
                holistic education that nurtures the intellectual, physical, social, and spiritual aspects of students'
                lives.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/history.jpg"
                alt="Historical photo of Bugema University"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission, Vision & Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Guiding principles that shape our approach to education and community service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To provide quality Christ-centered education that transforms students into responsible citizens and
                prepares them for service to God and humanity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To be a center of excellence in education, research, and community service, recognized globally for
                producing graduates who are agents of positive change.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Values</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Excellence in all endeavors</li>
                <li>• Integrity and ethical conduct</li>
                <li>• Service to humanity</li>
                <li>• Respect for diversity</li>
                <li>• Spiritual growth</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">University Leadership</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated team guiding Bugema University towards its vision and mission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Prof. Patrick Manu",
                title: "Vice Chancellor",
                image: "/images/leader1.jpg",
                bio: "Prof. Manu brings over 25 years of experience in higher education administration and research.",
              },
              {
                name: "Dr. Sarah Namukasa",
                title: "Deputy Vice Chancellor, Academic Affairs",
                image: "/images/leader2.jpg",
                bio: "Dr. Namukasa oversees all academic programs and ensures educational excellence.",
              },
              {
                name: "Mr. Daniel Okello",
                title: "University Secretary",
                image: "/images/leader3.jpg",
                bio: "Mr. Okello manages administrative functions and institutional operations.",
              },
            ].map((leader, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-64 relative">
                  <Image
                    src={leader.image || `/placeholder.svg?height=256&width=384`}
                    alt={leader.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                  <p className="text-blue-700 font-medium mb-3">{leader.title}</p>
                  <p className="text-gray-600">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/about/leadership">
              <Button variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-50">
                View Full Leadership Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campus */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6">Our Campus</h2>
              <p className="text-gray-700 mb-4">
                Situated on 640 acres of beautiful countryside just 32 kilometers north of Kampala, Bugema University
                offers a serene environment ideal for learning and personal growth.
              </p>
              <p className="text-gray-700 mb-4">
                Our campus features modern academic buildings, comfortable residence halls, a comprehensive library,
                state-of-the-art laboratories, sports facilities, and beautiful gardens.
              </p>
              <p className="text-gray-700 mb-6">
                The peaceful rural setting provides students with a distraction-free atmosphere while still being
                accessible to the amenities of Uganda's capital city.
              </p>
              <Link href="/campus-life">
                <Button className="bg-blue-700 hover:bg-blue-800">
                  Explore Our Campus <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image src="/images/campus1.jpg" alt="Campus Building" fill className="object-cover" />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image src="/images/campus2.jpg" alt="Campus Garden" fill className="object-cover" />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image src="/images/campus3.jpg" alt="Library" fill className="object-cover" />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden shadow-md">
                <Image src="/images/campus4.jpg" alt="Sports Field" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Achievements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Recognitions and milestones that highlight our commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">1948</div>
              <p className="text-gray-600">Year Founded</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">5,000+</div>
              <p className="text-gray-600">Students Enrolled</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">20+</div>
              <p className="text-gray-600">Countries Represented</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">30+</div>
              <p className="text-gray-600">Academic Programs</p>
            </div>
          </div>

          <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Key Milestones</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold">1948</h4>
                  <p className="text-gray-600">Founded as Bugema Missionary Training School</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold">1994</h4>
                  <p className="text-gray-600">Granted university status by the Ministry of Education</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold">2014</h4>
                  <p className="text-gray-600">Awarded University Charter by the Government of Uganda</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold">2020</h4>
                  <p className="text-gray-600">Recognized as one of the top private universities in East Africa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Bugema University Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of our legacy of excellence and make a difference in the world.
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
    </SiteLayout>
  )
}
