"use client"
import {
  Chart,
  ChartContainer,
  Bar,
  ChartLegend,
  ChartTooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "@/components/ui/chart"

export function EnrollmentChart() {
  const data = [
    { department: "Computer Science", students: 245 },
    { department: "Business", students: 320 },
    { department: "Engineering", students: 198 },
    { department: "Medicine", students: 156 },
    { department: "Arts", students: 132 },
    { department: "Education", students: 194 },
  ]

  return (
    <ChartContainer className="h-full">
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="department" />
        <YAxis />
        <Bar dataKey="students" fill="#4f46e5" />
        <ChartTooltip />
        <ChartLegend />
      </Chart>
    </ChartContainer>
  )
}

