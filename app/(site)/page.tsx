import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, GraduationCap, Users, BookOpen, Award, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden">
        <Image src="/campus.jpg" alt="Bugema University Campus" fill className="object-cover brightness-50" priority />
        <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">Welcome to Bugema University</h1>
          <p className="mb-8 max-w-2xl text-lg md:text-xl">
            A Seventh-day Adventist institution committed to excellence in teaching, research, and service.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button size="lg" asChild>
              <Link href="/admissions">Apply Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                  Academic Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Offering quality education with over 30 undergraduate and graduate programs across various
                  disciplines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Diverse Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  A vibrant community of students and faculty from over 20 countries around the world.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  Research Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Committed to advancing knowledge through innovative research and scholarly activities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  Holistic Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Nurturing intellectual, physical, social, and spiritual growth for well-rounded graduates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">Our Programs</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Discover our wide range of undergraduate and graduate programs designed to prepare you for success.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Program Card 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Business Administration</CardTitle>
                <CardDescription>School of Business</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Develop essential business skills and knowledge to excel in today's competitive global marketplace.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/academics/programs/business">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Program Card 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Computer Science</CardTitle>
                <CardDescription>School of Computing & Informatics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Gain cutting-edge skills in programming, software development, and information technology.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/academics/programs/computer-science">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Program Card 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>School of Education</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Prepare for a rewarding career in teaching and educational leadership with our comprehensive programs.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/academics/programs/education">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button variant="link" size="lg" asChild>
              <Link href="/academics/programs" className="text-primary">
                View All Programs <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">Upcoming Events</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Stay connected with what's happening on campus and in our community.
            </p>
          </div>

          <Carousel className="mx-auto max-w-4xl">
            <CarouselContent>
              {/* Event 1 */}
              <CarouselItem className="md:basis-1/2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">May 15, 2025</span>
                    </div>
                    <CardTitle className="mt-2">Open Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Join us for our annual Open Day to explore our campus, meet faculty, and learn about our programs.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Register
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>

              {/* Event 2 */}
              <CarouselItem className="md:basis-1/2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">June 5, 2025</span>
                    </div>
                    <CardTitle className="mt-2">Graduation Ceremony</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Celebrate the achievements of our graduating class of 2025 at our annual commencement ceremony.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>

              {/* Event 3 */}
              <CarouselItem className="md:basis-1/2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">July 10, 2025</span>
                    </div>
                    <CardTitle className="mt-2">Research Symposium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      A showcase of innovative research projects by our faculty and graduate students across
                      disciplines.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Register
                    </Button>
                  </CardFooter>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-8 text-center">
            <Button variant="link" size="lg" asChild>
              <Link href="/events" className="text-primary">
                View All Events <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Begin Your Journey?</h2>
          <p className="mx-auto mb-8 max-w-2xl">
            Take the first step towards a bright future with Bugema University. Apply now for our upcoming intake.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/admissions">Apply Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
