"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { BookOpen, Calendar, CheckSquare, ClipboardList, GraduationCap, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardCards() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"

  const studentCards = [
    {
      title: "Registered Courses",
      value: "5",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      link: "/dashboard/courses",
    },
    {
      title: "Attendance Rate",
      value: "92%",
      icon: <CheckSquare className="h-5 w-5 text-green-600" />,
      link: "/dashboard/attendance",
    },
    {
      title: "Registration Status",
      value: "Approved",
      icon: <ClipboardList className="h-5 w-5 text-yellow-600" />,
      link: "/dashboard/registration",
    },
    {
      title: "Upcoming Classes",
      value: "3",
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      link: "/dashboard/timetable",
    },
  ]

  const staffCards = [
    {
      title: "Courses Teaching",
      value: "3",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      link: "/dashboard/courses",
    },
    {
      title: "Students",
      value: "87",
      icon: <Users className="h-5 w-5 text-green-600" />,
      link: "/dashboard/students",
    },
    {
      title: "Pending Approvals",
      value: "12",
      icon: <ClipboardList className="h-5 w-5 text-yellow-600" />,
      link: "/dashboard/approvals",
    },
    {
      title: "Upcoming Classes",
      value: "4",
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      link: "/dashboard/timetable",
    },
  ]

  const registrarCards = [
    {
      title: "Total Students",
      value: "1,245",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      link: "/dashboard/students",
    },
    {
      title: "Departments",
      value: "8",
      icon: <GraduationCap className="h-5 w-5 text-green-600" />,
      link: "/dashboard/departments",
    },
    {
      title: "Pending Registrations",
      value: "32",
      icon: <ClipboardList className="h-5 w-5 text-yellow-600" />,
      link: "/dashboard/approvals",
    },
    {
      title: "Active Courses",
      value: "124",
      icon: <BookOpen className="h-5 w-5 text-purple-600" />,
      link: "/dashboard/courses",
    },
  ]

  const cards = userRole === "STUDENT" ? studentCards : userRole === "REGISTRAR" ? registrarCards : staffCards

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Link key={index} href={card.link}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
