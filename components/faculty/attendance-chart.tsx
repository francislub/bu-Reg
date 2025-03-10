"use client"
import {
  Chart,
  ChartContainer,
  ChartLegend,
  Line,
  ChartTooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "@/components/ui/chart"

export function AttendanceChart() {
  const data = [
    { course: "CSC101", attendance: 92 },
    { course: "CSC201", attendance: 88 },
    { course: "CSC301", attendance: 76 },
    { course: "CSC401", attendance: 84 },
  ]

  return (
    <ChartContainer className="h-full">
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis domain={[0, 100]} />
        <Line type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
        <ChartTooltip formatter={(value) => [`${value}%`, "Attendance Rate"]} />
        <ChartLegend />
      </Chart>
    </ChartContainer>
  )
}

