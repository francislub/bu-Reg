import Image from "next/image"
import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "History | Bugema University",
  description: "Learn about the rich history and heritage of Bugema University",
}

export default function HistoryPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Our History</h1>
        <p className="text-xl text-muted-foreground">
          Discover the journey of Bugema University from its founding to the present day
        </p>
        <Separator />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold">Founding Years (1948-1953)</h2>
              <p className="text-muted-foreground">
                Bugema University was established in 1948 as Bugema Missionary Training School with the aim of training
                teachers and evangelists. The institution began with just 12 students and 3 faculty members on a small
                piece of land donated by local leaders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold">Growth and Development (1954-1970)</h2>
              <p className="text-muted-foreground">
                During this period, the institution expanded its curriculum to include vocational training and secondary
                education. New buildings were constructed, including the first library and science laboratories. Student
                enrollment grew to over 200 by the end of the 1960s.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold">College Status (1971-1994)</h2>
              <p className="text-muted-foreground">
                In 1971, the institution was upgraded to Bugema Adventist College, offering diploma programs in
                education, business, and theology. Despite the challenging political climate in Uganda during the 1970s
                and early 1980s, the college maintained its operations and continued to grow.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="relative mb-6 h-80 overflow-hidden rounded-lg">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Historic photo of Bugema University"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black/50 p-4 text-white">
              <p className="text-sm">Bugema University campus, circa 1960</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold">University Charter (1995-2010)</h2>
              <p className="text-muted-foreground">
                A major milestone was achieved in 1995 when Bugema was granted university status by the government of
                Uganda. This allowed for the introduction of bachelor's degree programs and later master's programs. The
                university expanded its faculties and constructed modern facilities to accommodate the growing student
                population.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-semibold">Modern Era (2011-Present)</h2>
              <p className="text-muted-foreground">
                In recent years, Bugema University has continued to expand its academic offerings, research
                capabilities, and international partnerships. The university now serves thousands of students from
                across East Africa and beyond, with a commitment to providing quality education based on Christian
                values.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-3xl font-bold">Timeline of Key Events</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1948
            </div>
            <div>
              <h3 className="text-xl font-medium">Founding of Bugema Missionary Training School</h3>
              <p className="text-muted-foreground">
                Initial establishment with focus on teacher and evangelist training
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1971
            </div>
            <div>
              <h3 className="text-xl font-medium">Upgraded to Bugema Adventist College</h3>
              <p className="text-muted-foreground">Introduction of diploma programs in multiple disciplines</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1995
            </div>
            <div>
              <h3 className="text-xl font-medium">Granted University Charter</h3>
              <p className="text-muted-foreground">Official recognition as a university by the Ugandan government</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2007
            </div>
            <div>
              <h3 className="text-xl font-medium">Introduction of Graduate Programs</h3>
              <p className="text-muted-foreground">First master's degree programs launched</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2018
            </div>
            <div>
              <h3 className="text-xl font-medium">70th Anniversary Celebration</h3>
              <p className="text-muted-foreground">Marking seven decades of educational excellence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
