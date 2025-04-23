import Image from "next/image"
import type { Metadata } from "next"
import { MapPin, Clock, Users, BookOpen, Coffee, Home, Dumbbell, TreesIcon as Tree } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Campus Tour | Bugema University",
  description: "Explore the beautiful campus of Bugema University",
}

const facilities = [
  {
    name: "Main Administration Building",
    description:
      "Houses the Vice Chancellor's office, registrar, finance department, and other administrative offices.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    name: "University Library",
    description: "A modern facility with over 50,000 volumes, digital resources, and study spaces for students.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: "Science Complex",
    description: "State-of-the-art laboratories for biology, chemistry, physics, and computer science.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Student Center",
    description: "A hub for student activities, dining, recreation, and student services.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    name: "Residence Halls",
    description: "Comfortable on-campus housing options for both undergraduate and graduate students.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Sports Complex",
    description: "Includes a gymnasium, football field, basketball courts, and other athletic facilities.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    name: "Botanical Gardens",
    description: "A beautiful space for relaxation and botanical research, featuring indigenous plant species.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Tree className="h-5 w-5" />,
  },
  {
    name: "Auditorium",
    description: "A 1,000-seat venue for university events, conferences, and performances.",
    image: "/placeholder.svg?height=400&width=600",
    icon: <Users className="h-5 w-5" />,
  },
]

const tourSchedule = [
  {
    day: "Monday",
    times: ["9:00 AM", "1:00 PM"],
    guide: "Student Ambassadors",
  },
  {
    day: "Wednesday",
    times: ["10:00 AM", "2:00 PM"],
    guide: "Admissions Staff",
  },
  {
    day: "Friday",
    times: ["9:00 AM", "1:00 PM"],
    guide: "Student Ambassadors",
  },
  {
    day: "Saturday",
    times: ["11:00 AM"],
    guide: "Senior Staff",
  },
]

export default function CampusTourPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Campus Tour</h1>
        <p className="text-xl text-muted-foreground">Explore the beautiful 100-acre campus of Bugema University</p>
        <Separator />
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Welcome to Our Campus</h2>
          <p className="text-muted-foreground">
            Nestled in the lush greenery of central Uganda, Bugema University's campus provides an ideal environment for
            learning and personal growth. Our campus combines modern facilities with natural beauty to create a unique
            educational experience.
          </p>
          <p className="text-muted-foreground">
            Whether you're a prospective student, parent, or visitor, we invite you to explore our campus through this
            virtual tour or by scheduling an in-person visit.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg">Schedule a Visit</Button>
            <Button variant="outline" size="lg">
              Download Campus Map
            </Button>
          </div>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-lg md:h-[400px]">
          <Image
            src="/placeholder.svg?height=600&width=800"
            alt="Aerial view of Bugema University campus"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <Tabs defaultValue="facilities">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="facilities">Campus Facilities</TabsTrigger>
          <TabsTrigger value="virtual">Virtual Tour</TabsTrigger>
          <TabsTrigger value="visit">Plan Your Visit</TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((facility) => (
              <Card key={facility.name} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    {facility.icon}
                    <h3 className="text-lg font-semibold">{facility.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="virtual" className="space-y-8">
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="mb-4 text-lg font-medium">Virtual Tour Video</p>
                <p className="text-muted-foreground">Experience a 360° tour of our campus facilities</p>
                <Button className="mt-4">Play Virtual Tour</Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">Academic Buildings</h3>
                <p className="text-muted-foreground">
                  Explore our modern classrooms, lecture halls, and specialized learning spaces designed to enhance the
                  educational experience.
                </p>
                <Button variant="link" className="mt-2 p-0">
                  View Tour
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">Student Life</h3>
                <p className="text-muted-foreground">
                  Take a virtual walk through our residence halls, dining facilities, and recreational spaces where
                  students build community.
                </p>
                <Button variant="link" className="mt-2 p-0">
                  View Tour
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">Campus Grounds</h3>
                <p className="text-muted-foreground">
                  Experience the natural beauty of our campus with its gardens, walking paths, and outdoor gathering
                  spaces.
                </p>
                <Button variant="link" className="mt-2 p-0">
                  View Tour
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visit" className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-2xl font-semibold">Guided Tour Schedule</h3>
                <div className="space-y-4">
                  {tourSchedule.map((tour) => (
                    <div key={tour.day} className="flex items-start gap-4 border-b pb-4">
                      <Clock className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{tour.day}</p>
                        <p className="text-muted-foreground">Times: {tour.times.join(", ")}</p>
                        <p className="text-sm text-muted-foreground">Guide: {tour.guide}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-6 w-full">Book a Tour</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-2xl font-semibold">Visitor Information</h3>

                <div className="mb-4 space-y-2">
                  <h4 className="font-medium">Campus Location</h4>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Bugema University, Luweero District, Uganda
                  </p>
                </div>

                <div className="mb-4 space-y-2">
                  <h4 className="font-medium">Parking</h4>
                  <p className="text-muted-foreground">
                    Visitor parking is available at the main entrance. Please obtain a visitor's pass from the security
                    office.
                  </p>
                </div>

                <div className="mb-4 space-y-2">
                  <h4 className="font-medium">Accessibility</h4>
                  <p className="text-muted-foreground">
                    Our campus is accessible to individuals with disabilities. Wheelchair ramps, elevators, and
                    accessible restrooms are available in all main buildings.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Contact</h4>
                  <p className="text-muted-foreground">
                    For tour inquiries: tours@bugema.ac.ug or call +256-XXX-XXX-XXX
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg bg-muted p-6">
            <h3 className="mb-4 text-xl font-semibold">Group Tours</h3>
            <p className="mb-4 text-muted-foreground">
              We welcome school groups, community organizations, and other large groups to visit our campus. Special
              arrangements can be made for groups of 10 or more people.
            </p>
            <Button>Request Group Tour</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
