import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Trophy, Calendar, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Sports Programs | Bugema University",
  description: "Explore the sports programs, facilities, and athletic opportunities at Bugema University",
}

export default function SportsPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sports Programs</h1>
          <p className="text-muted-foreground">
            Explore the sports programs, facilities, and athletic opportunities at Bugema University
          </p>
        </div>

        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg">
          <Image
            src="/placeholder.svg?height=500&width=1200"
            alt="Bugema University sports facilities"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-2xl">
              <h2 className="text-2xl font-bold mb-2">Excellence in Athletics</h2>
              <p className="mb-4">
                Bugema University offers a wide range of sports programs that promote physical fitness, teamwork, and
                competitive excellence.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-white/10 text-white">
                  Football
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Basketball
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Volleyball
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Athletics
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Swimming
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Tennis
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sportsTeams.map((team, index) => (
                <TeamCard key={index} team={team} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {facilities.map((facility, index) => (
                <FacilityCard key={index} facility={facility} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-6">
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <EventCard key={index} event={event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-slate-50 p-6 rounded-lg mt-10">
          <div className="md:flex items-start gap-6">
            <div className="md:w-2/3 space-y-4">
              <h2 className="text-2xl font-bold">Join Our Athletic Programs</h2>
              <p>
                Whether you're an experienced athlete or just looking to stay active, Bugema University offers
                opportunities for all students to participate in sports.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Varsity Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Competitive teams that represent Bugema in intercollegiate competitions.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Intramural Sports</h3>
                  <p className="text-sm text-muted-foreground">
                    Recreational leagues for students to compete against fellow Bugema students.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Sports Clubs</h3>
                  <p className="text-sm text-muted-foreground">
                    Student-led organizations focused on specific sports or activities.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Fitness Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Group fitness classes and personal training opportunities.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 mt-6 md:mt-0">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium mb-2">Athletic Scholarships</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Bugema University offers athletic scholarships to talented student-athletes who demonstrate excellence
                  in their sport.
                </p>
                <Link href="/admissions/scholarships#athletic">
                  <Button variant="outline" className="w-full">
                    Learn About Scholarships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Team {
  name: string
  sport: string
  achievements: string
  coach: string
  practiceSchedule: string
  icon: React.ReactNode
}

function TeamCard({ team }: { team: Team }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">{team.icon}</div>
          <div>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>{team.sport}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Coach:</span> {team.coach}
        </div>
        <div className="text-sm">
          <span className="font-medium">Achievements:</span> {team.achievements}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{team.practiceSchedule}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Team Details
        </Button>
      </CardFooter>
    </Card>
  )
}

interface Facility {
  name: string
  description: string
  features: string[]
  hours: string
  location: string
}

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{facility.name}</CardTitle>
        <CardDescription>{facility.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <h4 className="text-sm font-medium mb-1">Features:</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {facility.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{facility.hours}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{facility.location}</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface Event {
  name: string
  date: string
  time: string
  location: string
  description: string
}

function EventCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{event.name}</CardTitle>
          <Badge>{event.date}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <p className="text-sm">{event.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" className="w-full">
          Add to Calendar
        </Button>
      </CardFooter>
    </Card>
  )
}

const sportsTeams: Team[] = [
  {
    name: "Bugema Lions",
    sport: "Football (Soccer)",
    achievements: "National University Champions 2022",
    coach: "Coach James Mwangi",
    practiceSchedule: "Mon, Wed, Fri 4:00-6:00 PM",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    name: "Bugema Eagles",
    sport: "Basketball",
    achievements: "Regional Finalists 2023",
    coach: "Coach Sarah Nakato",
    practiceSchedule: "Tue, Thu 5:00-7:00 PM",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    name: "Bugema Strikers",
    sport: "Volleyball",
    achievements: "University League Champions 2023",
    coach: "Coach Robert Kizito",
    practiceSchedule: "Mon, Wed, Fri 3:00-5:00 PM",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    name: "Bugema Runners",
    sport: "Athletics",
    achievements: "Multiple National Medals",
    coach: "Coach David Ochieng",
    practiceSchedule: "Daily 6:00-7:30 AM",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    name: "Bugema Dolphins",
    sport: "Swimming",
    achievements: "University Swimming Championship 2022",
    coach: "Coach Elizabeth Nambi",
    practiceSchedule: "Tue, Thu, Sat 7:00-9:00 AM",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    name: "Bugema Aces",
    sport: "Tennis",
    achievements: "Individual National Champions",
    coach: "Coach Michael Ssemakula",
    practiceSchedule: "Mon, Wed, Fri 4:00-6:00 PM",
    icon: <Trophy className="h-5 w-5" />,
  },
]

const facilities: Facility[] = [
  {
    name: "Main Stadium",
    description: "Multi-purpose stadium for football, athletics, and major sporting events",
    features: [
      "FIFA standard football pitch",
      "400m running track",
      "Seating capacity for 5,000 spectators",
      "Floodlights for evening events",
      "Electronic scoreboard",
    ],
    hours: "Open daily 6:00 AM - 9:00 PM",
    location: "North Campus",
  },
  {
    name: "Indoor Sports Complex",
    description: "Modern facility for basketball, volleyball, badminton, and other indoor sports",
    features: [
      "2 basketball courts",
      "3 volleyball courts",
      "4 badminton courts",
      "Spectator seating",
      "Locker rooms and showers",
    ],
    hours: "Open daily 6:00 AM - 10:00 PM",
    location: "Central Campus",
  },
  {
    name: "Aquatic Center",
    description: "State-of-the-art swimming facility",
    features: [
      "Olympic-sized swimming pool",
      "Diving platforms",
      "Training pool for beginners",
      "Sauna and steam rooms",
      "Pool-side seating",
    ],
    hours: "Open daily 6:00 AM - 8:00 PM",
    location: "East Campus",
  },
  {
    name: "Tennis Complex",
    description: "Tennis courts for recreational and competitive play",
    features: ["6 hard courts", "2 clay courts", "Coaching area", "Spectator seating", "Equipment rental"],
    hours: "Open daily 6:00 AM - 7:00 PM",
    location: "South Campus",
  },
]

const upcomingEvents: Event[] = [
  {
    name: "Inter-University Football Tournament",
    date: "May 15-20, 2024",
    time: "Matches from 2:00 PM daily",
    location: "Main Stadium",
    description: "Annual football tournament featuring universities from across East Africa.",
  },
  {
    name: "Bugema Athletics Championship",
    date: "June 5, 2024",
    time: "8:00 AM - 5:00 PM",
    location: "Main Stadium",
    description: "Track and field events for all Bugema students with medals and prizes.",
  },
  {
    name: "Basketball Finals",
    date: "April 30, 2024",
    time: "6:00 PM",
    location: "Indoor Sports Complex",
    description: "Championship game between finalists of the inter-faculty basketball tournament.",
  },
  {
    name: "Swimming Gala",
    date: "May 28, 2024",
    time: "9:00 AM - 3:00 PM",
    location: "Aquatic Center",
    description: "Annual swimming competition with individual and team events.",
  },
]
