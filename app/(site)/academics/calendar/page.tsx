import type { Metadata } from "next"
import { AcademicsLayout } from "@/components/site/academics-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Printer, ChevronRight, ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Academic Calendar | Bugema University",
  description:
    "View the academic calendar for Bugema University, including semester dates, registration periods, and holidays.",
}

export default function AcademicCalendarPage() {
  return (
    <AcademicsLayout
      title="Academic Calendar"
      description="Plan your academic year with our comprehensive calendar of important dates and deadlines."
      breadcrumbTitle="Academic Calendar"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Academic Calendar 2023-2024</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            The academic calendar provides important dates for the academic year, including semester start and end
            dates, registration periods, examination schedules, and holidays. Please note that dates are subject to
            change, and students should regularly check for updates.
          </p>

          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              2022-2023
            </Button>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-700" />
              <span className="font-semibold">Current Academic Year</span>
            </div>
            <Button variant="outline" size="sm">
              2024-2025
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="semester1" className="w-full">
          <TabsList className="grid grid-cols-3 h-auto">
            <TabsTrigger value="semester1" className="py-3">
              First Semester
            </TabsTrigger>
            <TabsTrigger value="semester2" className="py-3">
              Second Semester
            </TabsTrigger>
            <TabsTrigger value="summer" className="py-3">
              Summer Session
            </TabsTrigger>
          </TabsList>

          <TabsContent value="semester1" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>First Semester (August - December 2023)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CalendarSection
                    title="Registration Period"
                    events={[
                      { date: "August 1-4, 2023", description: "New Student Registration" },
                      { date: "August 7-11, 2023", description: "Returning Student Registration" },
                      { date: "August 14, 2023", description: "Late Registration Begins (Late Fee Applies)" },
                      { date: "August 18, 2023", description: "Registration Deadline" },
                    ]}
                  />

                  <CalendarSection
                    title="Academic Dates"
                    events={[
                      { date: "August 14, 2023", description: "Classes Begin" },
                      { date: "August 25, 2023", description: "Last Day to Add/Drop Courses" },
                      { date: "September 29, 2023", description: "Mid-Semester Examinations Begin" },
                      { date: "October 6, 2023", description: "Mid-Semester Examinations End" },
                      { date: "October 9, 2023", description: "Mid-Semester Break Begins" },
                      { date: "October 15, 2023", description: "Mid-Semester Break Ends" },
                      { date: "October 16, 2023", description: "Classes Resume" },
                      { date: "November 17, 2023", description: "Last Day of Classes" },
                      { date: "November 20, 2023", description: "Reading Week Begins" },
                      { date: "November 24, 2023", description: "Reading Week Ends" },
                      { date: "November 27, 2023", description: "Final Examinations Begin" },
                      { date: "December 8, 2023", description: "Final Examinations End" },
                      { date: "December 15, 2023", description: "Semester Grades Due" },
                    ]}
                  />

                  <CalendarSection
                    title="Holidays & Special Events"
                    events={[
                      { date: "September 9, 2023", description: "National Heroes Day (No Classes)" },
                      { date: "October 9, 2023", description: "Independence Day (No Classes)" },
                      { date: "December 9, 2023", description: "Graduation Ceremony" },
                      { date: "December 11, 2023", description: "Semester Break Begins" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semester2" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Second Semester (January - May 2024)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CalendarSection
                    title="Registration Period"
                    events={[
                      { date: "January 8-12, 2024", description: "New Student Registration" },
                      { date: "January 8-12, 2024", description: "Returning Student Registration" },
                      { date: "January 15, 2024", description: "Late Registration Begins (Late Fee Applies)" },
                      { date: "January 19, 2024", description: "Registration Deadline" },
                    ]}
                  />

                  <CalendarSection
                    title="Academic Dates"
                    events={[
                      { date: "January 15, 2024", description: "Classes Begin" },
                      { date: "January 26, 2024", description: "Last Day to Add/Drop Courses" },
                      { date: "March 1, 2024", description: "Mid-Semester Examinations Begin" },
                      { date: "March 8, 2024", description: "Mid-Semester Examinations End" },
                      { date: "March 11, 2024", description: "Mid-Semester Break Begins" },
                      { date: "March 17, 2024", description: "Mid-Semester Break Ends" },
                      { date: "March 18, 2024", description: "Classes Resume" },
                      { date: "April 19, 2024", description: "Last Day of Classes" },
                      { date: "April 22, 2024", description: "Reading Week Begins" },
                      { date: "April 26, 2024", description: "Reading Week Ends" },
                      { date: "April 29, 2024", description: "Final Examinations Begin" },
                      { date: "May 10, 2024", description: "Final Examinations End" },
                      { date: "May 17, 2024", description: "Semester Grades Due" },
                    ]}
                  />

                  <CalendarSection
                    title="Holidays & Special Events"
                    events={[
                      { date: "January 26, 2024", description: "NRM Day (No Classes)" },
                      { date: "March 8, 2024", description: "International Women's Day (No Classes)" },
                      { date: "April 7, 2024", description: "Good Friday (No Classes)" },
                      { date: "April 10, 2024", description: "Easter Monday (No Classes)" },
                      { date: "May 1, 2024", description: "Labor Day (No Classes)" },
                      { date: "May 25, 2024", description: "End of Year Ceremony" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summer" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Summer Session (June - July 2024)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CalendarSection
                    title="Registration Period"
                    events={[
                      { date: "May 27-31, 2024", description: "Summer Session Registration" },
                      { date: "June 3, 2024", description: "Late Registration Begins (Late Fee Applies)" },
                      { date: "June 5, 2024", description: "Registration Deadline" },
                    ]}
                  />

                  <CalendarSection
                    title="Academic Dates"
                    events={[
                      { date: "June 3, 2024", description: "Classes Begin" },
                      { date: "June 7, 2024", description: "Last Day to Add/Drop Courses" },
                      { date: "June 28, 2024", description: "Mid-Session Assessments" },
                      { date: "July 19, 2024", description: "Last Day of Classes" },
                      { date: "July 22-26, 2024", description: "Final Examinations" },
                      { date: "August 2, 2024", description: "Summer Session Grades Due" },
                    ]}
                  />

                  <CalendarSection
                    title="Holidays & Special Events"
                    events={[
                      { date: "June 9, 2024", description: "Martyrs' Day (No Classes)" },
                      { date: "June 3, 2024", description: "Heroes' Day (No Classes)" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Important Notes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All dates are subject to change. Students should regularly check for updates.</li>
            <li>
              Registration after the deadline requires approval from the Academic Registrar and incurs a late fee.
            </li>
            <li>Students must be fully registered to attend classes and take examinations.</li>
            <li>Tuition and fees must be paid according to the payment schedule to maintain registration status.</li>
            <li>Special arrangements for examinations must be requested at least two weeks in advance.</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Future Academic Years</h2>
          <p className="text-gray-700 mb-6">
            Tentative dates for future academic years are provided for planning purposes. These dates are subject to
            approval and may change.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2024-2025 Academic Year</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="font-medium">First Semester Begins:</span>
                    <span>August 12, 2024</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">First Semester Ends:</span>
                    <span>December 6, 2024</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Second Semester Begins:</span>
                    <span>January 13, 2025</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Second Semester Ends:</span>
                    <span>May 9, 2025</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2025-2026 Academic Year</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="font-medium">First Semester Begins:</span>
                    <span>August 11, 2025</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">First Semester Ends:</span>
                    <span>December 5, 2025</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Second Semester Begins:</span>
                    <span>January 12, 2026</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Second Semester Ends:</span>
                    <span>May 8, 2026</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AcademicsLayout>
  )
}

function CalendarSection({
  title,
  events,
}: {
  title: string
  events: { date: string; description: string }[]
}) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left font-medium text-gray-700 w-1/3">Date</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Event</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700 font-medium">{event.date}</td>
                <td className="py-3 px-4 text-gray-700">{event.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
