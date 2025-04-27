"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Database, Download, Loader2, Trash2, AlertCircle, Save } from "lucide-react"
import { createBackup, getBackups, deleteBackup } from "@/lib/actions/backup-actions"

export default function BackupsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backups, setBackups] = useState<any[]>([])
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null)
  const [isDeletingBackup, setIsDeletingBackup] = useState(false)

  // Check if user is authorized (only REGISTRAR or ADMIN)
  useEffect(() => {
    if (session && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchBackups = async () => {
      setIsLoading(true)
      try {
        const result = await getBackups()
        if (result.success) {
          setBackups(result.backups)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to fetch backups",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching backups:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "REGISTRAR" || session?.user?.role === "ADMIN") {
      fetchBackups()
    }
  }, [session, toast])

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      const result = await createBackup()
      if (result.success) {
        setBackups((prev) => [result.backup, ...prev])
        toast({
          title: "Success",
          description: "Backup created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return

    setIsDeletingBackup(true)
    try {
      const result = await deleteBackup(backupToDelete)
      if (result.success) {
        setBackups((prev) => prev.filter((backup) => backup.id !== backupToDelete))
        toast({
          title: "Success",
          description: "Backup deleted successfully",
        })
        setBackupToDelete(null)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingBackup(false)
    }
  }

  if (session && session.user.role !== "REGISTRAR" && session.user.role !== "ADMIN") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Database Backups" text="Manage and create database backups">
        <Button onClick={handleCreateBackup} disabled={isCreatingBackup} className="flex items-center gap-2">
          {isCreatingBackup ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create Backup
            </>
          )}
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage your database backups</CardDescription>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Backups Found</h3>
                  <p className="text-muted-foreground mt-2">Create your first backup to protect your data.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.filename}</TableCell>
                        <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{formatFileSize(backup.size)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setBackupToDelete(backup.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup Information</CardTitle>
              <CardDescription>Important information about database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Regular Backups</h4>
                    <p className="text-sm text-muted-foreground">
                      It's recommended to create regular backups, especially before major system changes or updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Backup Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Backups are stored on the server. For additional security, download important backups and store
                      them in a secure location.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Backup Retention</h4>
                    <p className="text-sm text-muted-foreground">
                      Old backups are not automatically deleted. Regularly review and remove unnecessary backups to save
                      storage space.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Backup Confirmation Dialog */}
      <Dialog open={!!backupToDelete} onOpenChange={(open) => !open && setBackupToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupToDelete(null)} disabled={isDeletingBackup}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBackup} disabled={isDeletingBackup}>
              {isDeletingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
