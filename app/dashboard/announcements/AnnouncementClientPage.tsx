"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FileEdit, Loader2, PlusCircle, Trash2 } from "lucide-react"
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from "@/lib/actions/announcement-actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"

const announcementSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
})

type AnnouncementFormValues = z.infer<typeof announcementSchema>

function AnnouncementsSkeleton() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Announcements" text="View and manage university announcements">
        <Skeleton className="h-10 w-[180px]" />
      </DashboardHeader>
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-4 w-[120px]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}

export function AnnouncementsPage({ announcements: initialAnnouncements }: { announcements: any[] }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  useEffect(() => {
    if (!session || session?.user?.role !== "REGISTRAR") {
      router.push("/dashboard/announcements")
    }
  }, [session, router])

  async function onSubmit(data: AnnouncementFormValues) {
    setIsLoading(true)
    try {
      let result
      if (isEditing && currentAnnouncementId) {
        result = await updateAnnouncement(currentAnnouncementId, data)
      } else {
        result = await createAnnouncement(data)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Announcement Updated" : "Announcement Created",
          description: isEditing
            ? "Announcement has been updated successfully."
            : "Announcement has been created successfully.",
        })
        form.reset()
        setIsDialogOpen(false)
        setIsEditing(false)
        setCurrentAnnouncementId(null)

        // Refresh announcements list
        const announcementsResult = await getAllAnnouncements()
        if (announcementsResult.success) {
          setAnnouncements(announcementsResult.announcements)
        }
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${isEditing ? "update" : "create"} announcement. Please try again.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} announcement:`, error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEdit(announcement: any) {
    setIsEditing(true)
    setCurrentAnnouncementId(announcement.id)
    form.reset({
      title: announcement.title,
      content: announcement.content,
    })
    setIsDialogOpen(true)
  }

  async function handleDeleteAnnouncement(announcementId: string) {
    setIsDeleting(true)
    try {
      const result = await deleteAnnouncement(announcementId)
      if (result.success) {
        toast({
          title: "Announcement Deleted",
          description: "Announcement has been deleted successfully.",
        })

        // Update local state
        setAnnouncements(announcements.filter((announcement) => announcement.id !== announcementId))
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete announcement. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setAnnouncementToDelete(null)
    }
  }

  if (!session || session?.user?.role !== "REGISTRAR") {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Announcements" text="Manage university announcements.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false)
                setCurrentAnnouncementId(null)
                form.reset({
                  title: "",
                  content: "",
                })
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the announcement details below." : "Enter the details for the new announcement."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter announcement title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Content <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter announcement content" className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      "Update Announcement"
                    ) : (
                      "Create Announcement"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Announcement List</CardTitle>
          <CardDescription>View and manage all university announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell className="max-w-md truncate">{announcement.content}</TableCell>
                    <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setAnnouncementToDelete(announcement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No announcements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!announcementToDelete} onOpenChange={(open) => !open && setAnnouncementToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => announcementToDelete && handleDeleteAnnouncement(announcementToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
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
