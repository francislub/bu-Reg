"use client"

import { Card } from "@/components/ui/card"
import { Chart, ChartContainer, ChartLegend, ChartPie, ChartTooltip } from "@/components/ui/chart"

export function CourseChart() {
  const data = [
    { name: "SEM1-2022-2023", value: 4, fill: "#4f46e5" },
    { name: "SEM2-2022-2023", value: 4, fill: "#ef4444" },
    { name: "SEM1-2023-2024", value: 4, fill: "#10b981" },
    { name: "SEM2-2023-2024", value: 4, fill: "#3b82f6" },
    { name: "SEM3-2023-2024", value: 2, fill: "#f97316" },
    { name: "SEM1-2024-2025", value: 4, fill: "#8b5cf6" },
  ]

  return (
    <Card className="w-full overflow-hidden">
      <ChartContainer className="h-80">
        <Chart data={data}>
          <ChartPie dataKey="value" nameKey="name" innerRadius={70} outerRadius={90} paddingAngle={2} />
          <ChartTooltip />
          <ChartLegend />
        </Chart>
      </ChartContainer>
    </Card>
  )
}

