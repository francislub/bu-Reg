import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface SystemOverviewProps {
  data: {
    usersByRole: {
      role: string
      count: number
    }[]
    registrationsByStatus: {
      status: string
      count: number
    }[]
    registrationsByMonth: {
      month: string
      count: number
    }[]
    studentsByProgram: {
      program: string
      count: number
    }[]
  }
}

export function SystemOverview({ data }: SystemOverviewProps) {
  // Format data for charts
  const userRoleData =
    data?.usersByRole?.map((item) => ({
      name: item.role.charAt(0) + item.role.slice(1).toLowerCase(),
      value: item.count,
    })) || []

  const registrationStatusData =
    data?.registrationsByStatus?.map((item) => ({
      name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
      value: item.count,
    })) || []

  const registrationTrendData = data?.registrationsByMonth || []

  const topPrograms = data?.studentsByProgram?.slice(0, 5) || []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
          <CardDescription>Distribution of users by their roles</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userRoleData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Registration Status</CardTitle>
          <CardDescription>Current registration status distribution</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={registrationStatusData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Top Programs</CardTitle>
          <CardDescription>Programs with the most students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPrograms.map((program, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{program.program}</p>
                </div>
                <div className="ml-2">
                  <p className="text-sm font-bold">{program.count}</p>
                </div>
              </div>
            ))}
            {topPrograms.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No program data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Registration Trends</CardTitle>
          <CardDescription>Monthly registration trends</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={registrationTrendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
