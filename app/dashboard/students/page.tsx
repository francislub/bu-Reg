import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StudentsClient } from "@/components/dashboard/students-client"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Students | Bugema University",
  description: "Manage university students",
}

// Update the getStudents function to include more profile information
async function getStudents() {
  try {
    const students = await db.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        profile: {
          include: {
            // Include related program and department information if needed
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return students
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}

// Update the getPrograms function to fetch programs for filtering
async function getPrograms() {
  try {
    const programs = await db.program.findMany({
      orderBy: {
        name: "asc",
      },
    })
    return programs
  } catch (error) {
    console.error("Error fetching programs:", error)
    return []
  }
}

async function getDepartments() {
  try {
    const departments = await db.department.findMany({
      orderBy: {
        name: "asc",
      },
    })
    return departments
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user has permission to view students
  const { user } = session
  if (user.role !== "ADMIN" && user.role !== "REGISTRAR" && user.role !== "LECTURER") {
    redirect("/dashboard")
  }

  const students = await getStudents()
  const departments = await getDepartments()
  const programs = await getPrograms()

  return (
    <DashboardShell>
      <StudentsClient initialStudents={students} departments={departments} programs={programs} />
    </DashboardShell>
  )
}
