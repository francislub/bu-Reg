import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { BookOpen, Calendar, Clock, GraduationCap, Heart, Home, Laptop, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Student Life | Bugema University",
  description: "Explore student life, resources, and opportunities at Bugema University",
}

const studentServices = [
  {
    title: "Academic Advising",
    description:
      "Get guidance on course selection, academic planning, and degree requirements from dedicated advisors.",
    icon: <BookOpen className="h-6 w-6" />,
    link: "#academic-advising",
  },
  {
    title: "Career Services",
    description: "Access career counseling, job search assistance, resume reviews, and interview preparation.",
    icon: <GraduationCap className="h-6 w-6" />,
    link: "#career-services",
  },
  {
    title: "Health & Wellness",
    description: "Comprehensive health services including medical care, counseling, and wellness programs.",
    icon: <Heart className="h-6 w-6" />,
    link: "#health-wellness",
  },
  {
    title: "Housing & Residence Life",
    description: "On-campus housing options with supportive residential communities and amenities.",
    icon: <Home className="h-6 w-6" />,
    link: "#housing",
  },
  {
    title: "Technology Services",
    description: "Computer labs, Wi-Fi access, technical support, and educational technology resources.",
    icon: <Laptop className="h-6 w-6" />,
    link: "#technology",
  },
  {
    title: "Student Activities",
    description: "Clubs, organizations, events, and leadership opportunities to enhance your university experience.",
    icon: <Users className="h-6 w-6" />,
    link: "#activities",
  },
]

const studentClubs = [
  {
    name: "Student Government Association",
    description: "Elected student body representing student interests and organizing campus-wide initiatives.",
    image: "/placeholder.svg?height=300&width=400",
    members: 25,
  },
  {
    name: "Debate Club",
    description: "Fostering critical thinking and public speaking skills through competitive debates.",
    image: "/placeholder.svg?height=300&width=400",
    members: 30,
  },
  {
    name: "Environmental Conservation Club",
    description: "Promoting sustainability and environmental awareness through campus initiatives.",
    image: "/placeholder.svg?height=300&width=400",
    members: 45,
  },
  {
    name: "Business & Entrepreneurship Society",
    description: "Connecting business-minded students with networking and startup opportunities.",
    image: "/placeholder.svg?height=300&width=400",
    members: 60,
  },
  {
    name: "Cultural Exchange Association",
    description: "Celebrating diversity and promoting cultural understanding through events and activities.",
    image: "/placeholder.svg?height=300&width=400",
    members: 50,
  },
  {
    name: "Music & Performing Arts Club",
    description: "Showcasing student talent through concerts, plays, and other performances.",
    image: "/placeholder.svg?height=300&width=400",
    members: 40,
  },
]

const upcomingEvents = [
  {
    title: "New Student Orientation",
    date: "August 25-27, 2023",
    location: "Main Campus",
    description:
      "Welcome program for incoming students with campus tours, information sessions, and social activities.",
  },
  {
    title: "Career Fair",
    date: "September 15, 2023",
    location: "Student Center",
    description: "Connect with potential employers from various industries for internships and job opportunities.",
  },
  {
    title: "Cultural Festival",
    date: "October 5-7, 2023",
    location: "University Grounds",
    description: "Annual celebration of cultural diversity featuring food, performances, and exhibitions.",
  },
  {
    title: "Academic Conference",
    date: "November 10-12, 2023",
    location: "Science Complex",
    description: "Student research presentations and keynote speakers from various academic disciplines.",
  },
]

export default function StudentsPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Student Life</h1>
        <p className="text-xl text-muted-foreground">
          Discover the vibrant community and resources available to Bugema University students
        </p>
        <Separator />
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Your University Experience</h2>
          <p className="text-muted-foreground">
            At Bugema University, student life extends far beyond the classroom. We believe in providing a holistic
            educational experience that nurtures academic, social, spiritual, and personal growth.
          </p>
          <p className="text-muted-foreground">
            Our vibrant campus community offers countless opportunities to make lifelong friends, develop leadership
            skills, pursue your passions, and create memories that will last a lifetime.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg">Student Portal Login</Button>
            <Button variant="outline" size="lg">
              Campus Events Calendar
            </Button>
          </div>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-lg md:h-[400px]">
          <Image src="/placeholder.svg?height=600&width=800" alt="Students on campus" fill className="object-cover" />
        </div>
      </div>

      <Tabs defaultValue="services">
        <TabsList className="mb-8 grid w-full grid-cols-4">
          <TabsTrigger value="services">Student Services</TabsTrigger>
          <TabsTrigger value="organizations">Clubs & Organizations</TabsTrigger>
          <TabsTrigger value="events">Events & Activities</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studentServices.map((service) => (
              <Card key={service.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary p-2 text-primary-foreground">{service.icon}</div>
                    <CardTitle>{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="px-0" asChild>
                    <Link href={service.link}>Learn More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="rounded-lg bg-muted p-6">
            <h3 className="mb-4 text-xl font-semibold">Student Support Center</h3>
            <p className="mb-4 text-muted-foreground">
              Our centralized Student Support Center is your one-stop location for accessing all student services.
              Located in the Student Center building, our friendly staff can assist you with questions about financial
              aid, registration, housing, and more.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Monday-Friday: 8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>support@bugema.ac.ug</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-8">
          <p className="text-lg text-muted-foreground">
            With over 50 student-led clubs and organizations, there's something for everyone at Bugema University. These
            groups provide opportunities to pursue your interests, develop leadership skills, and connect with
            like-minded peers.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studentClubs.map((club) => (
              <Card key={club.name} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={club.image || "/placeholder.svg"} alt={club.name} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle>{club.name}</CardTitle>
                  <CardDescription>{club.members} active members</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{club.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Join Club
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button>View All Clubs & Organizations</Button>
          </div>

          <div className="rounded-lg bg-muted p-6">
            <h3 className="mb-4 text-xl font-semibold">Start Your Own Club</h3>
            <p className="mb-4 text-muted-foreground">
              Don't see a club that matches your interests? Bugema University encourages students to create new
              organizations. The Student Activities Office can guide you through the process of establishing a new
              student group.
            </p>
            <Button variant="outline">Club Formation Guidelines</Button>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-8">
          <p className="text-lg text-muted-foreground">
            Campus life at Bugema University is enriched by a diverse calendar of events and activities throughout the
            academic year. From academic conferences to cultural celebrations, sporting events to community service
            opportunities, there's always something happening on campus.
          </p>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Upcoming Events</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <Card key={event.title}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{event.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Add to Calendar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-6">
            <h3 className="mb-4 text-xl font-semibold">Annual Traditions</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-medium">Founders' Day</h4>
                <p className="text-sm text-muted-foreground">
                  Annual celebration of the university's founding with special events, alumni gatherings, and historical
                  exhibitions.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Cultural Week</h4>
                <p className="text-sm text-muted-foreground">
                  Week-long festival showcasing the diverse cultures represented in our student body through food,
                  music, dance, and art.
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Graduation Ceremony</h4>
                <p className="text-sm text-muted-foreground">
                  Formal celebration of student achievement and the culmination of the academic journey at Bugema
                  University.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Academic Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">University Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to over 50,000 volumes, digital resources, study spaces, and research assistance.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Hours:</span> Monday-Friday 8:00 AM - 10:00 PM, Saturday 9:00 AM -
                    5:00 PM
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Learning Support Center</h3>
                  <p className="text-sm text-muted-foreground">
                    Free tutoring, writing assistance, study skills workshops, and academic coaching.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Location:</span> Education Building, Room 205
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Computer Labs</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple computer labs across campus with specialized software for various academic disciplines.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Access:</span> Available to all enrolled students with valid ID
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Academic Resources Guide
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Wellness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">Health Center</h3>
                  <p className="text-sm text-muted-foreground">
                    Primary healthcare services, preventive care, and health education for all students.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Hours:</span> Monday-Friday 8:00 AM - 5:00 PM, Emergency services
                    available 24/7
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Counseling Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Confidential counseling, mental health support, and crisis intervention.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Appointments:</span> Schedule online or call ext. 4567
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Recreation Center</h3>
                  <p className="text-sm text-muted-foreground">
                    Fitness facilities, group exercise classes, intramural sports, and outdoor adventure programs.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Hours:</span> Monday-Friday 6:00 AM - 10:00 PM, Weekends 8:00 AM -
                    8:00 PM
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Wellness Resources
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-medium">Financial Aid Office</h3>
                  <p className="text-sm text-muted-foreground">
                    Information and assistance with scholarships, grants, loans, and work-study opportunities.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Location:</span> Administration Building, Room 102
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Student Employment</h3>
                  <p className="text-sm text-muted-foreground">
                    On-campus job opportunities that accommodate student schedules and provide valuable work experience.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Job Board:</span> Available online through the Student Portal
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Financial Literacy Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Workshops and resources to help students manage their finances and plan for the future.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Schedule:</span> Monthly workshops announced via email
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Financial Resources Guide
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-16 rounded-lg bg-primary p-8 text-primary-foreground">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Student Testimonials</h2>
            <div className="space-y-6">
              <div className="rounded-lg bg-primary-foreground/10 p-4">
                <p className="italic text-primary-foreground/90">
                  "My experience at Bugema University has been transformative. The supportive community, dedicated
                  professors, and numerous opportunities for growth have helped me discover my potential and prepare for
                  my future career."
                </p>
                <p className="mt-2 font-medium">Sarah Namukasa, Business Administration, Class of 2023</p>
              </div>

              <div className="rounded-lg bg-primary-foreground/10 p-4">
                <p className="italic text-primary-foreground/90">
                  "Joining student clubs and participating in campus activities has enriched my university experience
                  beyond academics. I've developed leadership skills, made lifelong friends, and created memories that
                  I'll cherish forever."
                </p>
                <p className="mt-2 font-medium">David Okello, Computer Science, Class of 2024</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold">Get Involved</h2>
            <p className="mb-6">
              Your university experience is what you make of it. We encourage all students to get involved, explore
              their interests, and make the most of their time at Bugema University.
            </p>
            <div className="space-y-4">
              <Button variant="secondary" className="w-full">
                Join a Student Organization
              </Button>
              <Button variant="secondary" className="w-full">
                Volunteer Opportunities
              </Button>
              <Button variant="secondary" className="w-full">
                Leadership Development Programs
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Student Handbook
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
