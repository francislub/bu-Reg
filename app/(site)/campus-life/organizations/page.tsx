import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Users, Award, Calendar, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Student Organizations | Bugema University",
  description: "Discover the diverse student organizations and clubs at Bugema University",
}

export default function OrganizationsPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Organizations</h1>
          <p className="text-muted-foreground">
            Discover the diverse student organizations and clubs at Bugema University
          </p>
        </div>

        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Students participating in club activities"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-2xl">
              <h2 className="text-2xl font-bold mb-2">Get Involved</h2>
              <p className="mb-4">
                Join one of our many student organizations to enhance your university experience, develop leadership
                skills, and build lifelong friendships.
              </p>
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
                Start a New Club
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="cultural">Cultural</TabsTrigger>
            <TabsTrigger value="religious">Religious</TabsTrigger>
            <TabsTrigger value="recreational">Recreational</TabsTrigger>
          </TabsList>

          <TabsContent value="academic" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {academicOrgs.map((org, index) => (
                <OrganizationCard key={index} organization={org} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cultural" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {culturalOrgs.map((org, index) => (
                <OrganizationCard key={index} organization={org} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="religious" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {religiousOrgs.map((org, index) => (
                <OrganizationCard key={index} organization={org} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recreational" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recreationalOrgs.map((org, index) => (
                <OrganizationCard key={index} organization={org} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-slate-50 p-6 rounded-lg mt-10">
          <h2 className="text-2xl font-bold mb-4">Start a New Organization</h2>
          <p className="mb-4">
            Don't see an organization that matches your interests? Bugema University encourages students to start new
            clubs and organizations.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium mb-2">1. Find Faculty Advisor</h3>
              <p className="text-sm text-muted-foreground">
                Secure a faculty member who will serve as your organization's advisor.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium mb-2">2. Recruit Members</h3>
              <p className="text-sm text-muted-foreground">
                Gather at least 10 interested students to form your initial membership.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium mb-2">3. Submit Application</h3>
              <p className="text-sm text-muted-foreground">
                Complete the new organization application form with your constitution and bylaws.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/campus-life/organizations/new">
              <Button>Start Application Process</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Organization {
  name: string
  description: string
  icon: React.ReactNode
  memberCount: number
  meetingSchedule: string
}

function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">{organization.icon}</div>
          <CardTitle>{organization.name}</CardTitle>
        </div>
        <CardDescription>{organization.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>{organization.memberCount} members</span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-2">
          <Calendar className="h-4 w-4" />
          <span>{organization.meetingSchedule}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  )
}

const academicOrgs: Organization[] = [
  {
    name: "Business Club",
    description: "For students interested in business, entrepreneurship, and finance",
    icon: <Award className="h-5 w-5" />,
    memberCount: 45,
    meetingSchedule: "Tuesdays, 4:00 PM",
  },
  {
    name: "Computer Science Society",
    description: "Exploring technology, programming, and computer science innovations",
    icon: <Award className="h-5 w-5" />,
    memberCount: 38,
    meetingSchedule: "Wednesdays, 5:30 PM",
  },
  {
    name: "Future Health Professionals",
    description: "Preparing students for careers in healthcare and medicine",
    icon: <Award className="h-5 w-5" />,
    memberCount: 52,
    meetingSchedule: "Mondays, 6:00 PM",
  },
]

const culturalOrgs: Organization[] = [
  {
    name: "African Cultural Association",
    description: "Celebrating the diverse cultures of Africa through events and activities",
    icon: <Users className="h-5 w-5" />,
    memberCount: 63,
    meetingSchedule: "Fridays, 3:00 PM",
  },
  {
    name: "International Students Club",
    description: "Supporting international students and promoting cultural exchange",
    icon: <Users className="h-5 w-5" />,
    memberCount: 41,
    meetingSchedule: "Thursdays, 5:00 PM",
  },
  {
    name: "Arts & Culture Society",
    description: "Promoting visual arts, music, dance, and cultural performances",
    icon: <Users className="h-5 w-5" />,
    memberCount: 37,
    meetingSchedule: "Saturdays, 2:00 PM",
  },
]

const religiousOrgs: Organization[] = [
  {
    name: "Adventist Youth Society",
    description: "Spiritual growth and community service for Adventist youth",
    icon: <Heart className="h-5 w-5" />,
    memberCount: 75,
    meetingSchedule: "Saturdays, 4:00 PM",
  },
  {
    name: "Christian Union",
    description: "Interdenominational fellowship for Christian students",
    icon: <Heart className="h-5 w-5" />,
    memberCount: 58,
    meetingSchedule: "Sundays, 10:00 AM",
  },
  {
    name: "Prayer Warriors",
    description: "Dedicated to prayer and spiritual support for the campus community",
    icon: <Heart className="h-5 w-5" />,
    memberCount: 32,
    meetingSchedule: "Daily, 6:00 AM",
  },
]

const recreationalOrgs: Organization[] = [
  {
    name: "Outdoor Adventure Club",
    description: "Hiking, camping, and outdoor activities for nature enthusiasts",
    icon: <Calendar className="h-5 w-5" />,
    memberCount: 43,
    meetingSchedule: "Monthly outings",
  },
  {
    name: "Chess Club",
    description: "Strategic thinking and friendly competition through chess",
    icon: <Calendar className="h-5 w-5" />,
    memberCount: 26,
    meetingSchedule: "Tuesdays, 7:00 PM",
  },
  {
    name: "Photography Club",
    description: "Developing photography skills and capturing campus life",
    icon: <Calendar className="h-5 w-5" />,
    memberCount: 34,
    meetingSchedule: "Wednesdays, 4:30 PM",
  },
]
