"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Database, HardDrive, Server, Users } from "lucide-react"

interface SystemOverviewProps {
  systemStats: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    uptime: number
    lastBackup?: Date
    activeUsers: number
  }
}

export function SystemOverview({ systemStats }: SystemOverviewProps) {
  // Format uptime to days, hours
  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.floor(hours % 24)
    return `${days}d ${remainingHours}h`
  }

  // Format date to readable format
  const formatDate = (date: Date) => {
    if (!date) return "Never"
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Server className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.cpuUsage}%</div>
            <Progress value={systemStats.cpuUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <HardDrive className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.memoryUsage}%</div>
            <Progress value={systemStats.memoryUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.diskUsage}%</div>
            <Progress value={systemStats.diskUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">Currently online</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Uptime</CardTitle>
            <CardDescription>Time since last system restart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 mr-4 text-muted-foreground" />
              <div>
                <div className="text-3xl font-bold">{formatUptime(systemStats.uptime)}</div>
                <p className="text-sm text-muted-foreground">Continuous operation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>Database health and backup information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Backup:</span>
                <span className="text-sm">{formatDate(systemStats.lastBackup || new Date())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Size:</span>
                <span className="text-sm">128 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Connection Pool:</span>
                <span className="text-sm">8/10</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
