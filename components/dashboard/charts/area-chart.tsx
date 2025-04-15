"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AreaChartProps {
  data: any[]
  xAxisKey: string
  areas: {
    dataKey: string
    name: string
    color: string
    fillOpacity?: number
  }[]
  height?: number
}

export function DashboardAreaChart({ data, xAxisKey, areas, height = 350 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {areas.map((area, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            fill={area.color}
            fillOpacity={area.fillOpacity || 0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
