import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface RegistrationTrendsProps {
  data: {
    registrationTrends: {
      period: string
      approved: number
      pending: number
      rejected: number
      total: number
    }[]
    registrationsByProgram: {
      program: string
      count: number
    }[]
  }
}

export function RegistrationTrends({ data }: RegistrationTrendsProps) {
  const trendsData = data?.registrationTrends || []
  const programData = data?.registrationsByProgram || []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Registration Trends Over Time</CardTitle>
          <CardDescription>Registration statistics over the past academic periods</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="#82ca9d" name="Approved" />
              <Line type="monotone" dataKey="pending" stroke="#ffc658" name="Pending" />
              <Line type="monotone" dataKey="rejected" stroke="#ff8042" name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrations by Program</CardTitle>
            <CardDescription>Distribution of registrations across programs</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={programData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="program" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Registrations" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Completion Rate</CardTitle>
            <CardDescription>Percentage of completed registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#82ca9d"
                  name="Completion Rate (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
