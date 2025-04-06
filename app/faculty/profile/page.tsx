"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, User } from "lucide-react"

interface FacultyProfile {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  bio: string
  officeHours: string
  officeLocation: string
  image: string
  totalCourses: number
  totalStudents: number
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<FacultyProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    position: "",
    bio: "",
    officeHours: "",
    officeLocation: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        phone: profile.phone || "",
        department: profile.department || "",
        position: profile.position || "",
        bio: profile.bio || "",
        officeHours: profile.officeHours || "",
        officeLocation: profile.officeLocation || "",
      })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/faculty/profile?facultyId=${session.user.id}`)
      const data = await res.json()
      setProfile(data.profile)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to fetch profile information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      const res = await fetch(`/api/faculty/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facultyId: session.user.id,
          ...formData,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await res.json()

      // Update local state
      setProfile((prev) => ({
        ...prev!,
        ...formData,
      }))

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
        },
      })

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "FP"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={profile.image || ""} alt={profile.name} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.position}</p>
            <p className="text-muted-foreground">{profile.department}</p>

            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="w-full mt-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <span className="text-2xl font-bold">{profile.totalCourses}</span>
                <span className="text-xs text-muted-foreground">Courses</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <span className="text-2xl font-bold">{profile.totalStudents}</span>
                <span className="text-xs text-muted-foreground">Students</span>
              </div>
            </div>

            {!isEditing && (
              <Button variant="outline" className="mt-6 w-full" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium">
                      Department
                    </label>
                    <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="position" className="text-sm font-medium">
                      Position
                    </label>
                    <Input id="position" name="position" value={formData.position} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="officeHours" className="text-sm font-medium">
                      Office Hours
                    </label>
                    <Input
                      id="officeHours"
                      name="officeHours"
                      value={formData.officeHours}
                      onChange={handleInputChange}
                      placeholder="e.g. Mon, Wed 2-4 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="officeLocation" className="text-sm font-medium">
                      Office Location
                    </label>
                    <Input
                      id="officeLocation"
                      name="officeLocation"
                      value={formData.officeLocation}
                      onChange={handleInputChange}
                      placeholder="e.g. Building A, Room 101"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Tell students about yourself, your research interests, and teaching philosophy"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.bio && (
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Department</h3>
                    <p className="text-sm text-muted-foreground">{profile.department || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Position</h3>
                    <p className="text-sm text-muted-foreground">{profile.position || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Office Hours</h3>
                    <p className="text-sm text-muted-foreground">{profile.officeHours || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Office Location</h3>
                    <p className="text-sm text-muted-foreground">{profile.officeLocation || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

