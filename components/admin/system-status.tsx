"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, Server, Database, Users, Clock } from "lucide-react"

interface SystemMetric {
  id: string
  name: string
  value: number
  max: number
  unit: string
  status: "healthy" | "warning" | "critical"
}

export function SystemStatus() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics([
        {
          id: "1",
          name: "Server Load",
          value: 42,
          max: 100,
          unit: "%",
          status: "healthy",
        },
        {
          id: "2",
          name: "Database Connections",
          value: 156,
          max: 200,
          unit: "connections",
          status: "healthy",
        },
        {
          id: "3",
          name: "Memory Usage",
          value: 6.2,
          max: 8,
          unit: "GB",
          status: "warning",
        },
        {
          id: "4",
          name: "Active Users",
          value: 324,
          max: 1000,
          unit: "users",
          status: "healthy",
        },
        {
          id: "5",
          name: "API Response Time",
          value: 230,
          max: 500,
          unit: "ms",
          status: "healthy",
        },
      ])
      setLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  const getStatusIcon = (status: SystemMetric["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getMetricIcon = (name: string) => {
    if (name.includes("Server")) return <Server className="h-4 w-4" />
    if (name.includes("Database")) return <Database className="h-4 w-4" />
    if (name.includes("Users")) return <Users className="h-4 w-4" />
    if (name.includes("Response")) return <Clock className="h-4 w-4" />
    return <Server className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const percentage = (metric.value / metric.max) * 100

        return (
          <div key={metric.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getMetricIcon(metric.name)}
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {metric.value} / {metric.max} {metric.unit}
                </span>
                {getStatusIcon(metric.status)}
              </div>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${
                metric.status === "critical"
                  ? "bg-red-100"
                  : metric.status === "warning"
                    ? "bg-amber-100"
                    : "bg-green-100"
              }`}
            />
          </div>
        )
      })}

      <div className="text-xs text-gray-500 text-right pt-2">Last updated: {lastUpdated.toLocaleTimeString()}</div>
    </div>
  )
}

