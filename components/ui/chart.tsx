"use client"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

import { cn } from "@/lib/utils"

const ChartContainer = ({ className, children }: { className?: string; children: React.ReactElement }) => (
  <div className={cn("w-full", className)}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
)

export {
  ChartContainer,
  PieChart as Chart,
  Pie as ChartPie,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} 