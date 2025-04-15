"use client"

import { useState } from "react"
import { Calendar, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { DashboardLineChart } from "./charts/line-chart"

export function RegistrationHistory({ registrations }: { registrations: any[] }) {
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({})

  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }))
  }

  // Prepare data for the chart
  const semesterCredits = registrations.map((reg) => {
    const totalCredits = reg.courseUploads.reduce((sum: number, upload: any) => sum + upload.course.credits, 0)
    return {
      semester: reg.semester.name,
      credits: totalCredits,
    }
  })

  return (
    <div className="space-y-6">
      {registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Hours by Semester</CardTitle>
            <CardDescription>Your credit hours across different semesters</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <DashboardLineChart
              data={semesterCredits}
              xAxisKey="semester"
              lines={[
                {
                  dataKey: "credits",
                  name: "Credit Hours",
                  color: "#3b82f6",
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Registration History</h3>
              <p className="text-muted-foreground">
                You haven't registered for any courses yet. When you register for courses, they will appear here.
              </p>
              <Button className="mt-4" onClick={() => (window.location.href = "/dashboard/register-courses")}>
                Register for Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{registration.semester.name}</CardTitle>
                  <Badge
                    variant={
                      registration.status === "PENDING"
                        ? "secondary"
                        : registration.status === "APPROVED"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {registration.status.charAt(0) + registration.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <CardDescription>Registered on {formatDate(new Date(registration.createdAt))}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Courses:</span> {registration.courseUploads.length}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Total Credits:</span>{" "}
                      {registration.courseUploads.reduce((sum: number, upload: any) => sum + upload.course.credits, 0)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSemester(registration.id)}
                    className="flex items-center"
                  >
                    {expandedSemesters[registration.id] ? (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Hide Courses
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-4 w-4 mr-1" />
                        View Courses
                      </>
                    )}
                  </Button>
                </div>

                {expandedSemesters[registration.id] && (
                  <div className="space-y-3 mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Registered Courses</h4>
                    <div className="grid gap-3">
                      {registration.courseUploads.map((upload: any) => (
                        <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="text-sm font-medium">
                              {upload.course.code}: {upload.course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{upload.course.credits} Credit Hours</p>
                          </div>
                          <Badge
                            variant={
                              upload.status === "PENDING"
                                ? "secondary"
                                : upload.status === "APPROVED"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {upload.status.charAt(0) + upload.status.slice(1).toLowerCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {registration.status === "APPROVED" && (
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => (window.location.href = "/dashboard/registration-card")}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Registration Card
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
