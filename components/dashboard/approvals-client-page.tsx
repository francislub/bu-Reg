"use client"

import { useState, useEffect } from "react"
import { getAllPendingRegistrations } from "@/lib/actions/registration-actions"
import ApprovalsClient from "@/components/dashboard/approvals-client"
import { getPendingCourseUploads } from "@/lib/actions/course-registration-actions"

export default function ApprovalsClientPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [pendingCourseUploads, setPendingCourseUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const registrations = await getAllPendingRegistrations()
        const courseUploads = await getPendingCourseUploads()
        setPendingRegistrations(registrations)
        setPendingCourseUploads(courseUploads)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Registration Approvals</h1>
          <p className="text-muted-foreground">Approve or reject student registrations and course selections</p>
        </div>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Registration Approvals</h1>
        <p className="text-muted-foreground">Approve or reject student registrations and course selections</p>
      </div>

      <ApprovalsClient pendingRegistrations={pendingRegistrations} pendingCourseUploads={pendingCourseUploads} />
    </div>
  )
}
